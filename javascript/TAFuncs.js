/* ---------------------------------------------------------------------------------------- */
/* 												                        					*/
/*  LUNA VIEW                                                      							*/ 
/*  TECHNICAL ANALYSIS  																	*/                                              
/*                                                              							*/ 
/* ---------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------- */
/* 	        				                        										*/
/* ---------------------------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------------------- */
// RSI
/* ----------------------------------------------------------------------------------------- */

    function RSI(data, periods){
                
     
        var dataOBj = []
        
        // Calculate Change between ticks
        for(let i = 0; i < data.length ; i ++){
            
            var price = data[i].c; 
           
            
            dataOBj.push( { price: price } );
            if(i == 0){
                dataOBj[i].change = null;                
            }else{
                var pricePrev = data[i-1].c
                dataOBj[i].change = price - pricePrev;             
            }
        }
        
        // Get the gains / losses
        for(let i = 1 ; i < data.length ; i ++){
            if(dataOBj[i].change > 0){
                dataOBj[i].gain = parseFloat( dataOBj[i].change );
                dataOBj[i].loss = 0;               
            }else{
                dataOBj[i].gain = 0;
                dataOBj[i].loss = Math.abs( dataOBj[i].change ) ;    
            }
        }
        
        // Get first avg gains / losses
        let gainAvg0 = 0;
        let lossAvg0 = 0;
        for(let i = 1 ; i <= periods ; i ++){
            gainAvg0 = parseFloat(gainAvg0) +  parseFloat( dataOBj[i].gain );               
            lossAvg0 = parseFloat(lossAvg0) + parseFloat( dataOBj[i].loss );           
        }

        dataOBj[periods].avgGain = gainAvg0 / periods;
        dataOBj[periods].avgLoss = lossAvg0 / periods;
        dataOBj[periods].rs = parseFloat( dataOBj[periods].avgGain) / parseFloat(dataOBj[periods].avgLoss);
        dataOBj[periods].rsi = 100 - (100 / (1 + dataOBj[periods].rs ) ); 
        
        // Continue thorugh the array to build avg gain / loss
        var prevAVGGain = dataOBj[periods].avgGain;
        var prevAVGLoss = dataOBj[periods].avgLoss;
        for(let i = periods+1; i < data.length ; i ++){
            
            dataOBj[i].avgGain = parseFloat(((prevAVGGain*(periods-1)) + dataOBj[i].gain)) / periods;
            dataOBj[i].avgLoss = parseFloat(((prevAVGLoss*(periods-1)) + dataOBj[i].loss)) / periods;
                
            
            dataOBj[i].avgGain = parseFloat( (dataOBj[i].gain * (2 / (1 + periods) )) + (1 - (1 / periods) ) * prevAVGGain );
            dataOBj[i].avgLoss = parseFloat( (dataOBj[i].loss * (2 / (1 + periods) )) + (1 - (1 / periods) ) * prevAVGLoss );
            
            dataOBj[i].rs = parseFloat(dataOBj[i].avgGain) / parseFloat(dataOBj[i].avgLoss);
            dataOBj[i].rsi = 100 - ( 100 / (1+dataOBj[i].rs));

            prevAVGGain = dataOBj[i].avgGain;
            prevAVGLoss = dataOBj[i].avgLoss;
            
            data[i].RSI = { rsi: dataOBj[i].rsi, rs: dataOBj[i].rs };
            
        }        
        
        return dataOBj;
        
    }


/* ----------------------------------------------------------------------------------------- */
// SMA (SIMPLE MOVING AVERAGE)
/* ----------------------------------------------------------------------------------------- */


    function SMA(data, periods){
        
        var dataOBj = [];
        
        var SMA = new Array(arrayPrices.length -1).fill(null);
        var pr = 0;
        
        periods = typeof periods !== 'undefined' ? periods : 14;
        
        
        if(arrayPrices.length < periods){
            return 0;
        }
            
        for(let i = 0 ; i < data.length; i++){
            
            // Skip periods where we can not calculate
            if(i < periods-1){
                continue;
            }
            
            // Calculate
            pr = 0;
            for(let n = periods-1; n >= 0; n--){
                pr = parseFloat(arrayPrices[i - n]) + pr;
            }
            pr = pr / periods;
                
            SMA[i] = pr;
            
            
        }
        
        
        return SMA;
        
        
        
    }

/* ----------------------------------------------------------------------------------------- */
// CONVERT TIME 
/* ----------------------------------------------------------------------------------------- */
	
	function unix2time(timestamp){
		
		var t = new Date(timestamp);

		var year = t.getUTCFullYear();
		var month = ("0" + (t.getUTCMonth()+1)).slice(-2);
		var date = t.getDate();
		var hour = ("0" + t.getUTCHours()).slice(-2);
		var min = ("0" + t.getUTCMinutes()).slice(-2);
		var sec = ("0" + t.getUTCSeconds()).slice(-2);
		var time = date + '-' + month + '-' + year + ' ' + hour + ':' + min + ':' + sec ;
		
		return time;
		
	}