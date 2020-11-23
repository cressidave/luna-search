/* ---------------------------------------------------------------------------------------- */
/* 												                        					*/
/* LUNA VIEW                                                       							*/ 
/*  																						*/                                              
/*                                                              							*/ 
/* ---------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------- */
/* GLOBALS    				                        										*/
/* ---------------------------------------------------------------------------------------- */
    
    var DATA15m;
    var DATA1m;
    var cint;

    var chart1 = null; var chart2 = null;

/* ---------------------------------------------------------------------------------------- */
/* READY - LET'S GO!!   	                        										*/
/* ---------------------------------------------------------------------------------------- */

    $(document).ready(function(){
        
        loadMarket($('body').data('market'));
        
    });
   
/* ---------------------------------------------------------------------------------------- */
/* LOAD MARKET DATA        	                        										*/
/* ---------------------------------------------------------------------------------------- */

    function loadMarket(selection){
        
        var f1 = '';
        var f2 = '';
        var fl = '';
        
        switch(selection){
            
            case 'ETHUSDT':
                DATA15m = JSON.parse(ETHUSDT15m);
                DATA1m = JSON.parse(ETHUSDT1m); 
            break;
            
            case 2:

            break;
                                
            default:
                DATA15m = JSON.parse(BTCUSDT15m);
                DATA1m = JSON.parse(BTCUSDT1m);    
                
        }
        
    }


/* ---------------------------------------------------------------------------------------- */
/* COPY DATA    			                        										*/
/* ---------------------------------------------------------------------------------------- */
    
    var contentToCopy;
    function copyDataToClipboard(e) {
        e.preventDefault(); // default behaviour is to copy any selected text
        e.clipboardData.setData("text/plain", contentToCopy);
    }
    function copy(content) {
        contentToCopy = content;
        document.addEventListener("copy", copyDataToClipboard);
        try {
            document.execCommand("copy");
        } catch (exception) {
            console.error("Copy to clipboard failed");
        } finally {
            document.removeEventListener("copy", copyDataToClipboard);
        }
    }

/* ---------------------------------------------------------------------------------------- */
/* CLASSIFY DATA			                        										*/
/* ---------------------------------------------------------------------------------------- */

    function classifyData(){
        $('.collapse').collapse('hide');
        var takeVal = $('#take').val();
        var stopVal = $('#stop').val();
        var maxTimeVal = $('#maxTime').val();
        
        classify([ DATA15m, DATA1m ], takeVal, stopVal, maxTimeVal);
        
        $('#btn-saveClass').fadeIn();
        $('#btn-loadClass').fadeOut();
        
    }

    function saveClassData(){
        var d = JSON.stringify(DATA15m);
        copy(d);
        alert("DATA COPIED - PASTE INTO TEXT FILE");
        $('.collapse').collapse('hide');
    }

    function loadClassData(){
        
        $('.collapse').collapse('hide');
        DATA15m = JSON.parse( $('#preClass').val() );
        
        $('#preClass').val('');
        
        var totalCount = 0;
        for(let i = 0; i < DATA15m.length; i++){
            totalCount++;
            
        }
        
        $('#classify-status').html('ITEMS: '+totalCount);
        //$('#classify-status').append('<p>Seconds: '+runTime+'</p>');
        
    }

/* ---------------------------------------------------------------------------------------- */
/* ANALYSE DATA   			                        										*/
/* ---------------------------------------------------------------------------------------- */

    function analyseData(){
        
        var rsiPeriod   = parseInt($('#rsi-period').val());
        var rsiBelow    = parseInt($('#rsi-below').val());
        var rsiAbove    = parseInt($('#rsi-above').val());
        
        var volX    = parseInt($('#volX').val());
        var volY    = parseInt($('#volY').val());
        
        // BUILD RSI
        RSI(DATA15m, rsiPeriod);
        var data = { data: [], data1: [], totalTrades: 0, totalPL: 0, labels: [] };
        for(let i = rsiPeriod+2; i < DATA15m.length; i++){
            
            if(typeof DATA15m[i-2].RSI == 'undefined'){
                console.log("SKIPPED DATA - NO RSI - ITEM: "+i);
                continue;
            }
            
            
            // Volume
            var volX_total = 0;
            var volY_total = 0;
            for(let n = 1; n <= volX; n++ ){
                volX_total += parseFloat( DATA15m[i-n].vol );
            }
            
            for(let n = 1; n <= volY; n++ ){
                volY_total += parseFloat( DATA15m[i-n].vol );
            }
            
            volX_total = volX_total / volX;
            volY_total = volY_total / volY;
            
            var d = DATA15m[i];
            var p = parseFloat(d.classify.profit);
            var r = parseFloat(d.RSI.rsi) ;
            r =  DATA15m[i-1].RSI.rsi - DATA15m[i-2].RSI.rsi;
            
            if(DATA15m[i-2].RSI.rsi <= rsiBelow && DATA15m[i-1].RSI.rsi  > rsiAbove && volX_total >= volY_total){
                data.totalTrades++;
                data.totalPL += p;
                if(p > 0){
                    data.data.push( {x: r, y: p} );
                }else{
                    data.data1.push( {x: r, y: p} );
                }
            }
        }
        
        console.log(data)
        
        $('#analyseOutput').html('<p>TRADES: '+data.totalTrades+'</p>');
        $('#analyseOutput').append('<p>P&L: '+data.totalPL+'</p>');
        
        
        var ctx = document.getElementById('chart1').getContext('2d');
        if(chart1 !== null){
            chart1.destroy();
        }
        chart1 = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'PROFIT',
                    backgroundColor: 'rgba(124,255,99,1.00)',
                    borderColor: 'rgba(109,235,65,1.00)',
                    data: data.data
                },{
                    label: 'LOSS',
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: data.data1
                }
                           
                ]
            },
            options: {}
        });
        
        simulateTrading();
    }


/* ---------------------------------------------------------------------------------------- */
/* SIMULATE TRADING  			                        								    */
/* ---------------------------------------------------------------------------------------- */

    function simulateTrading(){
        
        var rsiPeriod   = parseInt($('#rsi-period').val());
        var rsiBelow    = parseInt($('#rsi-below').val());
        var rsiAbove    = parseInt($('#rsi-above').val());
        
        var volX    = parseInt($('#volX').val());
        var volY    = parseInt($('#volY').val());
        
        // BUILD RSI
        RSI(DATA15m, rsiPeriod);
        var trades = { trades: 0, missedTrades: 0, nextTradeTime: 0, data: [0], data1:[100], labels: [0] };
        for(let i = rsiPeriod+2; i < DATA15m.length; i++){
            
            if(typeof DATA15m[i-2].RSI == 'undefined'){
                console.log("SKIPPED DATA - NO RSI - ITEM: "+i);
                continue;
            }
            
            var d = DATA15m[i];
            var t = parseInt(d.openTime)/1000;
            var p = parseFloat(d.classify.profit);
            var r = parseFloat(d.RSI.rsi) ;
            r =  DATA15m[i-1].RSI.rsi - DATA15m[i-2].RSI.rsi;
            
            
            // Volume
            var volX_total = 0;
            var volY_total = 0;
            for(let n = 1; n <= volX; n++ ){
                volX_total += parseFloat( DATA15m[i-n].vol );
            }
            
            for(let n = 1; n <= volY; n++ ){
                volY_total += parseFloat( DATA15m[i-n].vol );
            }
            
            volX_total = volX_total / volX;
            volY_total = volY_total / volY;
            
            if(DATA15m[i-2].RSI.rsi <= rsiBelow && DATA15m[i-1].RSI.rsi  > rsiAbove && volX_total >= volY_total){
                
                if(t > trades.nextTradeTime){
                    
                    trades.trades++;
                    trades.data.push(  trades.data[ trades.data.length-1 ]+ p  );
                    trades.data1.push(  trades.data1[ trades.data1.length-1 ] + ( (p/100) * trades.data1[ trades.data1.length-1 ]) );
                    trades.labels.push( unix2time(d.openTime) )
                    trades.nextTradeTime = t + parseInt(d.classify.minutes)/1000;
                        
                }else{
                    
                    trades.missedTrades++;
                    
                }

            }
        }
        
        console.log(trades);
        
        var ctx = document.getElementById('chart2').getContext('2d');
        if(chart2 !== null){
            chart2.destroy();
        }
        chart2 = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trades.labels,
                datasets: [{
                    label: 'PROFIT',
                    backgroundColor: 'rgba(124,255,99,1.00)',
                    borderColor: 'rgba(109,235,65,1.00)',
                    data: trades.data1,
                    fill: false
                }
                ]
                
            },
            options: {}
        });
        
    }

/* ---------------------------------------------------------------------------------------- */
/* TRAIN DATA   			                        										*/
/* ---------------------------------------------------------------------------------------- */

    function trainData(){
        
        var rsiPeriod   = parseInt($('#rsi-period').val());
        var rsiLookback = parseInt($('#rsi-look').val());
        
        // BUILD RSI
        RSI(DATA15m, rsiPeriod);
        
        
        var data = { data: [], labels: [] };
        for(let i = (rsiPeriod + rsiLookback + 1); i < DATA15m.length-1; i++){
            //let label = BTCUSDT15m[i].classify.clss;
            let rsi  = [];
            for(let n = rsiLookback; n > 0; n-- ){
                rsi.push( DATA15m[i-n].RSI.rsi  );
            }
            rsi.reverse();
            data.data.push( rsi );
            data.labels.push( DATA15m[i].classify.softmax );
        }

        
        const model = new tfModel( data.data, data.labels );
        model.train();
    
    }