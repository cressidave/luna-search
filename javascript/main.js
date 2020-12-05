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
                DATA1d = JSON.parse(ETHUSDT1d);
                DATA15m = JSON.parse(ETHUSDT15m);
                DATA1m = JSON.parse(ETHUSDT1m); 
            break;
            
            case 'XRPBTC':
                DATA1d = JSON.parse(XRPBTC1d);
                DATA15m = JSON.parse(XRPBTC15m);
                DATA1m = JSON.parse(XRPBTC1m); 
            break;
                                
            default:
                DATA1d = JSON.parse(BTCUSDT1d);
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
        
        var maPeriod   = parseInt($('#ma-period').val());
        
        var rsiPeriod1   = parseInt($('#rsi-period1').val());
        var rsiPeriod2   = parseInt($('#rsi-period2').val());

        
        // BUILD RSI
        RSI(DATA15m, rsiPeriod1);
        RSI(DATA15m, rsiPeriod2);
        
        SMA(DATA1d, maPeriod)
 

        
        var skip = (rsiPeriod1 > rsiPeriod2)? rsiPeriod1+2: rsiPeriod2+2;
        
        var data = { data: [], data1: [], totalTrades: 0, avg: { win: 0, loss: 0 }, totalPL: 0, winners: 0, labels: [] };
        for(let i = skip; i < DATA15m.length; i++){
            
            if(typeof DATA15m[i-2].RSI == 'undefined'){
                console.log("SKIPPED DATA - NO RSI - ITEM: "+i);
                continue;
            }
            
            if(typeof DATA15m[i-2].RSI["p"+rsiPeriod1] == 'undefined' || typeof DATA15m[i-2].RSI["p"+rsiPeriod2] == 'undefined'){
                continue;
            }
            
            
            var d = DATA15m[i];
            var t = parseInt(d.openTime)/1000;
            var p = parseFloat(d.classify.profit);
            var d1ma = getDayData(t, maPeriod);
            var r = DATA15m[i-1].RSI["p"+rsiPeriod1].rsi - DATA15m[i-2].RSI["p"+rsiPeriod1].rsi;
            
            //console.log(d1ma)
            
            if(d1ma == false){
                continue;
            }
            
            if(DATA15m[i-2].RSI["p"+rsiPeriod1].rsi <= DATA15m[i-2].RSI["p"+rsiPeriod2].rsi && DATA15m[i-1].RSI["p"+rsiPeriod1].rsi > DATA15m[i-1].RSI["p"+rsiPeriod2].rsi && d.o > d1ma ){
                data.totalTrades++;
                data.totalPL += p;
                if(p > 0){
                    data.winners++;
                    data.data.push( {x: r, y: p} );
                    data.avg.win += p;
                }else{
                    data.data1.push( {x: r, y: p} );
                    data.avg.loss += p;
                }
            }
        }
        
        console.log(data)
        
        $('#analyseOutput').html('<p class="m-0">TRADES: '+data.totalTrades+'</p>');
        $('#analyseOutput').append('<p class="m-0">WINS: '+data.winners+' ['+ ( (data.winners / data.totalTrades) * 100 ).toFixed(2) +'%]</p>');
        $('#analyseOutput').append('<p class="m-0">AVG WIN: '+ ( (data.avg.win / data.winners) ).toFixed(2) +'%</p>');
        $('#analyseOutput').append('<p class="m-0">AVG LOSS: '+ ( (data.avg.loss / (data.totalTrades-data.winners)) ).toFixed(2) +'%</p>');
        $('#analyseOutput').append('<p class="m-0">P&L: '+data.totalPL+'</p>');
        
        
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
        
        var maPeriod   = parseInt($('#ma-period').val());
        
        var rsiPeriod1   = parseInt($('#rsi-period1').val());
        var rsiPeriod2   = parseInt($('#rsi-period2').val());

          
        var skip = (rsiPeriod1 > rsiPeriod2)? rsiPeriod+2: rsiPeriod2+2;
        var trades = { trades: 0, missedTrades: 0, nextTradeTime: 0, data: [0], data1:[100], labels: [0] };
        for(let i = skip; i < DATA15m.length; i++){
            
            if(typeof DATA15m[i-2].RSI == 'undefined'){
                console.log("SKIPPED DATA - NO RSI - ITEM: "+i);
                continue;
            }
            
            if(typeof DATA15m[i-2].RSI["p"+rsiPeriod1] == 'undefined' || typeof DATA15m[i-2].RSI["p"+rsiPeriod2] == 'undefined'){
                continue;
            }
        
            
            var d = DATA15m[i];
            var t = parseInt(d.openTime)/1000;
            var p = parseFloat(d.classify.profit);
                                   
            var d1ma = getDayData(t, maPeriod);
            
            if(d1ma == false){
                continue;
            }
            
            if(DATA15m[i-2].RSI["p"+rsiPeriod1].rsi <= DATA15m[i-2].RSI["p"+rsiPeriod2].rsi && DATA15m[i-1].RSI["p"+rsiPeriod1].rsi > DATA15m[i-1].RSI["p"+rsiPeriod2].rsi && d.o > d1ma){
                
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
/* GET DAY DATA   			                        										*/
/* ---------------------------------------------------------------------------------------- */

    function getDayData(timestamp, periods){
        
        for(let i = 0; i < DATA1d.length; i++){
            
            if( typeof DATA1d[i].SMA == 'undefined'){
                continue;
            }
            
            if( timestamp > (DATA1d[i].openTime/1000) && timestamp <  ((DATA1d[i].openTime/1000) + (60*60*24))  ){
                return DATA1d[i].SMA['p'+periods];
            }
            
        }
        return false;
        
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