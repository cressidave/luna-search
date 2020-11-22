/* ---------------------------------------------------------------------------------------- */
/* 												                        					*/
/* LUNA VIEW                                                       							*/ 
/*  																						*/                                              
/*                                                              							*/ 
/* ---------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------- */
/* 	        				                        										*/
/* ---------------------------------------------------------------------------------------- */

    class tfModel{
        
        
        constructor(inputs, labels){
            
            
            this.inputs = inputs;
            this.outputs = labels;
            
            this.model  = tf.sequential();
            this.batchSize = 256;
            this.learningRate = 0.03;
            this.epochs = 4000;            
            
            this.trainingData = { x: null, y: null };
            this.validationData = { x: null, y: null };
            
            this.createTrainingData(80);
            this.createCNN_Model();
            
            
            
        }
        
        createCNN_Model(){
            
            this.model.add( tf.layers.inputLayer( { inputShape: [ this.inputs[0].length ] } ) );
            this.model.add(tf.layers.dense({units: 100}));
            this.model.add(tf.layers.reshape({targetShape: [10,10]}));
            
            let lstm_cells = [];
            for (let index = 0; index < 8; index++) {
                lstm_cells.push(tf.layers.lstmCell({units: 20}));
            }

            this.model.add(tf.layers.rnn({
                cell: lstm_cells,
                inputShape: [10,10],
                returnSequences: false
            }));
            
            this.model.add(tf.layers.dense( {  activation: 'softmax', units: 4 } ))
            this.model.compile({
                optimizer: tf.train.adam(this.learningRate),
                loss: 'categoricalCrossentropy'
            });
            
            tfvis.show.modelSummary({name: 'Model Summary'}, this.model);
            
        }
        
        createTrainingData(trainingsize){
            
            let X = this.inputs.slice(0, Math.floor(trainingsize / 100 * this.inputs.length));
            let Y = this.outputs.slice(0, Math.floor(trainingsize / 100 * this.outputs.length));
            this.trainingData.x = tf.tensor2d(X, [X.length, X[0].length]).div(tf.scalar(100));
            this.trainingData.y = tf.tensor2d(Y, [Y.length, Y[0].length]);
 
        }
        
       async train(){
            
           
            const hist = await this.model.fit(this.trainingData.x, this.trainingData.y,
                { batchSize: this.batchSize, epochs: this.epochs, 
                  callbacks: {
                    onEpochEnd: async (epoch, log) => {
                        console.log(log); // ,log
                        $('#train-output').append('<p class="mb-0">Epoch '+(epoch+1)+'/'+this.epochs+': '+(log.loss).toFixed(4)+'</p>') 
                    },
                    onTrainBegin: ()=>{
                        $('#train-output').append('<p class="mb-0">STARTING...</p>') 
                        console.log("STARTED")
                    },
                    onBatchEnd: (batch, logs) =>{
                      console.log(logs)
                           
                    }
                      
                  }
                });
            
        }
        
        
        
        
    }