/* ---------------------------------------------------------------------------------------- */
/* 												                        					*/
/* LUNA VIEW                                                       							*/ 
/*  																						*/                                              
/*                                                              							*/ 
/* ---------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------- */
/* GLOBALS    				                        										*/
/* ---------------------------------------------------------------------------------------- */
    
    var BTCUSDT15m;
    var BTCUSDT1m;
    var cint;

/* ---------------------------------------------------------------------------------------- */
/* READY - LET'S GO!!   	                        										*/
/* ---------------------------------------------------------------------------------------- */

    $(document).ready(function(){
        
        // LOAD DATA
        BTCUSDT15m = JSON.parse(BTCUSDT15m);
        BTCUSDT1m  = JSON.parse(BTCUSDT1m);
        
        
    });
   

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
        
        classify([ BTCUSDT15m, BTCUSDT1m ], takeVal, stopVal, maxTimeVal);
        
        $('#btn-saveClass').fadeIn();
        $('#btn-loadClass').fadeOut();
        
    }

    function saveClassData(){
        var d = JSON.stringify(BTCUSDT15m);
        copy(d);
        alert("DATA COPIED - PASTE INTO TEXT FILE");
        $('.collapse').collapse('hide');
    }

    function loadClassData(){
        
        $('.collapse').collapse('hide');
        BTCUSDT15m = JSON.parse( $('#preClass').val() );
        
        $('#preClass').val('');
        
        var totalCount = 0;
        for(let i = 0; i < BTCUSDT15m.length; i++){
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
        
        // BUILD RSI
        RSI(BTCUSDT15m, rsiPeriod);
        var data = { data: [], data1: [], totalTrades: 0, totalPL: 0, labels: [] };
        for(let i = rsiPeriod+2; i < BTCUSDT15m.length; i++){
            
            if(typeof BTCUSDT15m[i-2].RSI == 'undefined'){
                console.log("SKIPPED DATA - NO RSI - ITEM: "+i);
                continue;
            }
            
            var d = BTCUSDT15m[i];
            var p = parseFloat(d.classify.profit);
            var r = d.RSI.rsi ;
            r =  BTCUSDT15m[i-1].RSI.rsi - BTCUSDT15m[i-2].RSI.rsi;
            
            if(BTCUSDT15m[i-2].RSI.rsi <= rsiBelow && BTCUSDT15m[i-1].RSI.rsi  > rsiAbove){
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
        var chart = new Chart(ctx, {
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
        
        
    }


/* ---------------------------------------------------------------------------------------- */
/* TRAIN DATA   			                        										*/
/* ---------------------------------------------------------------------------------------- */

    function trainData(){
        
        var rsiPeriod   = parseInt($('#rsi-period').val());
        var rsiLookback = parseInt($('#rsi-look').val());
        
        // BUILD RSI
        RSI(BTCUSDT15m, rsiPeriod);
        
        
        var data = { data: [], labels: [] };
        for(let i = (rsiPeriod + rsiLookback + 1); i < BTCUSDT15m.length-1; i++){
            //let label = BTCUSDT15m[i].classify.clss;
            let rsi  = [];
            for(let n = rsiLookback; n > 0; n-- ){
                rsi.push( BTCUSDT15m[i-n].RSI.rsi  );
            }
            rsi.reverse();
            data.data.push( rsi );
            data.labels.push( BTCUSDT15m[i].classify.softmax );
        }

        
        const model = new tfModel( data.data, data.labels );
        model.train();
    
    }