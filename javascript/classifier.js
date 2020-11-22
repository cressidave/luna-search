/* ---------------------------------------------------------------------------------------- */
/* 												                        					*/
/* LUNA VIEW                                                       							*/ 
/*  																						*/                                              
/*                                                              							*/ 
/* ---------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------- */
/* 	        				                        										*/
/* ---------------------------------------------------------------------------------------- */

    function classify(data, take, stop, maxTime){
        
        var dS = data[0];
        var dM = data[1];
        
        var progress = 0;
        var totalCount = dS.length;
        
        var startTime = new Date().getTime();
        
        var classes = [ 'win', 'loss', 'maxtime-win', 'maxtime-loss' ];
        var classesCount = [ 0, 0, 0, 0 ];
        
        
        $('#classify-progress').css('width', '0%');
        $('#classify-progress-wrap').fadeIn();
        
        clearInterval(cint);
        
        // Iterate dS data and label
        cint = setInterval(function(){
            
            
            var runTime = new Date().getTime();
            runTime = (runTime - startTime) / 1000;
            
            var dSi = dS[progress];
            var openTime= parseFloat(dSi['openTime']);
            var openPrice = parseFloat(dSi['o']);
            var classification = classifyCheck(dM, openTime, openPrice, take, stop, maxTime);
            
            classification.softmax =  [0,0,0,0];  
            
            classification.softmax[classes.indexOf( classification.clss )] = 1;
            
            dSi.classify = classification;
            
            classesCount[ classes.indexOf( classification.clss ) ]++;
            
            progress++;
            
            if(progress%100 == 0){
                $('#classify-progress').css('width', (progress/totalCount)*100+'%');
                $('#classify-status').html('PROGRSS: '+progress+' / '+ totalCount);
                $('#classify-status').append('<p>Seconds: '+runTime+'</p>');
                for(let q = 0; q < classes.length; q++){
                    $('#classify-status').append('<p class="mb-0">'+classes[q]+': '+classesCount[q]+'</p>');
                }
            }
            if(progress == totalCount){
                $('#classify-progress-wrap').fadeOut();
                $('#classify-status').html('PROGRSS: '+progress+' / '+ totalCount +' '+classification.clss);
                $('#classify-status').append('<p>Seconds: '+runTime+'</p>');
                for(let q = 0; q < classes.length; q++){
                    $('#classify-status').append('<p class="mb-0">'+classes[q]+': '+classesCount[q]+'</p>');
                }
                clearInterval(cint);
            }
            
            
            
            
        },0);
        
    }


    function classifyCheck(dM, openTime, openPrice, take, stop, maxTime){
        
        var drawDown = null;
        var profit   = null;
        
        var minCount = 0;
        
        // Iterate dM data and label
        for(let i = 0; i < dM.length; i++){
            
            var dMi = dM[i];
            var openTimeM = dMi['openTime'];
            
            if(openTimeM > openTime){
                
                minCount++;
                
                var h = parseFloat(dMi['h']);
                var l = parseFloat(dMi['l']);

                
                var drawDownCheck = ((openPrice - l) / openPrice) * 100;
                var profitCheck   = ((h - openPrice) / openPrice) * 100;
                
                
                drawDown = (drawDown === null || drawDownCheck < drawDown)? drawDownCheck : drawDown;
                profit   = (profit === null || profitCheck > profit)? profitCheck : profit;
                
                // Check loss first. Assume a loss is hit before a profit [SAFE]
                if(drawDownCheck >= stop){
                    return { clss: 'loss', drawdown: drawDownCheck, profit: -stop  }
                }
                
                // Check if profit has been hit
                if(profitCheck >= take){
                    return { clss: 'win', drawdown: drawDown, profit: take  }
                }
                
                if(minCount > maxTime){
                    // Max Time hit return current PL based on the l
                    if(l > openPrice){
                        return { clss: 'maxtime-win', drawdown: drawDown, profit: ((l-openPrice)/openPrice)*100  }
                    }else{
                        return { clss: 'maxtime-loss', drawdown: drawDown, profit: -((openPrice-l)/openPrice)*100  }
                    }
                }
                
            }
            
        }
        
        
        
    }