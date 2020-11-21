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
/* TRAIN DATA   			                        										*/
/* ---------------------------------------------------------------------------------------- */

    function trainData(){
        
        var rsiPeriod   = parseInt($('#rsi-period').val());
        var rsiLookback = parseInt($('#rsi-look').val());
        
        // BUILD RSI
        RSI(BTCUSDT15m, rsiPeriod);
        
        
        var data = { data: [], labels: [] };
        for(let i = rsiPeriod+rsiLookback+1; i < BTCUSDT15m.length-rsiPeriod+rsiLookback; i++){
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