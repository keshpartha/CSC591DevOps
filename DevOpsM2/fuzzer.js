var test = require('tap').test,
    //fuzzer = require('fuzzer'),
    Random = require('random-js')
    fs = require('fs'),
    //stackTrace = require('stack-trace')
    stackTrace = require('stacktrace-parser'),
    randomstring = require("randomstring"),
    _=require('underscore'),
    arrandom = require('arrandom');
   

const RandomMaker = require('random-maker');    

var fuzzer = 
{
    random : new Random(Random.engines.mt19937().seed(0)),
    
    seed: function (kernel)
    {
        fuzzer.random = new Random(Random.engines.mt19937().seed(kernel));

    },

    generateRandomIntegerArray: function (size) {
        const randomMaker = new RandomMaker(1000);
        return randomMaker.batch(size);
    },

    generateRandomStringArray: function (size)
    {
        var randomStringArray=[];
        for (var i = size - 1; i >= 0; i--) {
            randomStringArray[i]='"'+randomstring.generate({length: fuzzer.random.integer(1,25), charset: 'alphanumeric'})+'"';
        };
        return arrandom(randomStringArray);
    },

    generateRandomMixedArray: function (size)
    {
        var randomMixedArray=[];
        for (var i = size - 1; i >= 0; i--) {
            if(fuzzer.random.bool(0.5))
                randomMixedArray[i]='"'+randomstring.generate({length: fuzzer.random.integer(1,25), charset: 'alphanumeric'})+'"';
            else
                randomMixedArray[i]=fuzzer.random.integer(1,10000);
        };
        return arrandom(randomMixedArray);
    },

    generateRandomInteger: function () {
    	return fuzzer.random.integer(1,10000);
    },

    generateRandomString: function () {
    	return '"' + randomstring.generate({length: fuzzer.random.integer(1,100), charset: 'alphanumeric'})+'"';
    }
};

fuzzer.seed(0);

function generateTests() {

	var content = "var sets = require('./lib/simplesets.js')\n";

	for ( var i = 0; i < 300; i=i+3 ) {
		var size = fuzzer.random.integer(10, 100);
		var set1,set2;

		set1 = fuzzer.generateRandomMixedArray(size);
		set2 = fuzzer.generateRandomStringArray(size);
		set3 = fuzzer.generateRandomIntegerArray(size);

		var samples = [set1, set2, set3];

		content += "var s{0} = new sets.Set([{1}]);\n".format(i, set1);
		content += "var s{0} = new sets.Set([{1}]);\n".format(i+1, set2);
		content += "var s{0} = new sets.Set([{1}]);\n".format(i+2, set3);

		// for ( var j = 0; j < 3; j++ ) {
		// 	var temp = i + j;
		// 	content += "{};\n".format(i+2, set3);
		// }
		
		_.each(samples,function(sample,index){
			//has
			content += "s{0}.has({1});\n".format(i+index, sample[fuzzer.random.integer(0,sample.length-1)]);
			content += "s{0}.has({1});\n".format(i+index, fuzzer.generateRandomInteger());
			content += "s{0}.has({1});\n".format(i+index, fuzzer.generateRandomString());

			//add
			if ( index == 2) {
				content += "s{0}.add({1});\n".format(i+index, fuzzer.generateRandomInteger());

			} else {
				content += "s{0}.add({1});\n".format(i+index, fuzzer.generateRandomString());
				content += "s{0}.add({1});\n".format(i+index, fuzzer.generateRandomInteger());
			}

			//remove
			content += "s{0}.remove({1});\n".format(i+index, sample[fuzzer.random.integer(0,sample.length-1)]);
			content += "s{0}.remove({1});\n".format(i+index, fuzzer.generateRandomInteger());
			content += "s{0}.remove({1});\n".format(i+index, fuzzer.generateRandomString());

			//union
			content += "s{0}.union(s{1});\n".format(i+index,i+2-index);		

			//interseaction
			content += "s{0}.intersection(s{1});\n".format(i+index,i+2-index);	

			//difference
			content += "s{0}.difference(s{1});\n".format(i+index,i+2-index);	

			//symmetric_difference
			content += "s{0}.symmetric_difference(s{1});\n".format(i+index,i+2-index);	

			//issuperset
			content += "s{0}.issuperset(s{1});\n".format(i+index,i+2-index);	

			//issubset
			content += "s{0}.issubset(s{1});\n".format(i+index,i+2-index);	

			//array
			content += "s{0}.array();\n".format(i+index);

			//size
			content += "s{0}.size();\n".format(i+index);	
			
			//copy
			content += "s{0}.copy();\n".format(i+index);									

			//pick
			content += "s{0}.pick();\n".format(i+index);

			//pop
			content += "s{0}.pop();\n".format(i+index);

			//equals
			content += "s{0}.equals(s{1});\n".format(i+index,i+2-index);	
			content += "s{0}.equals(s{1}.copy());\n".format(i+index,i+index);

		});
	}

	for ( var i = 0; i < 300; i=i+3 ) {
		var size = fuzzer.random.integer(10, 100);
		var set1,set2;

		set1 = fuzzer.generateRandomMixedArray(size);
		set2 = fuzzer.generateRandomStringArray(size);
		set3 = fuzzer.generateRandomIntegerArray(size);

		var samples = [set1, set2, set3];

		content += "var s{0} = new sets.StringSet([{1}]);\n".format(i, set1);
		content += "var s{0} = new sets.StringSet([{1}]);\n".format(i+1, set2);
		content += "var s{0} = new sets.StringSet([{1}]);\n".format(i+2, set3);

		_.each(samples,function(sample,index){
			//has
			content += "s{0}.has({1});\n".format(i+index, sample[fuzzer.random.integer(0,sample.length-1)]);
			content += "s{0}.has({1});\n".format(i+index, fuzzer.generateRandomInteger());
			content += "s{0}.has({1});\n".format(i+index, fuzzer.generateRandomString());

			//add
			if ( index == 2) {
				content += "s{0}.add({1});\n".format(i+index, fuzzer.generateRandomInteger());

			} else {
				content += "s{0}.add({1});\n".format(i+index, fuzzer.generateRandomString());
				content += "s{0}.add({1});\n".format(i+index, fuzzer.generateRandomInteger());
			}

			//remove
			content += "s{0}.remove({1});\n".format(i+index, sample[fuzzer.random.integer(0,sample.length-1)]);
			content += "s{0}.remove({1});\n".format(i+index, fuzzer.generateRandomInteger());
			content += "s{0}.remove({1});\n".format(i+index, fuzzer.generateRandomString());

			//union
			content += "s{0}.union(s{1});\n".format(i+index,i+2-index);		

			//interseaction
			content += "s{0}.intersection(s{1});\n".format(i+index,i+2-index);	

			//difference
			content += "s{0}.difference(s{1});\n".format(i+index,i+2-index);	

			//symmetric_difference
			content += "s{0}.symmetric_difference(s{1});\n".format(i+index,i+2-index);	

			//issuperset
			content += "s{0}.issuperset(s{1});\n".format(i+index,i+2-index);	

			//issubset
			content += "s{0}.issubset(s{1});\n".format(i+index,i+2-index);	

			//array
			content += "s{0}.array();\n".format(i+index);

			//size
			content += "s{0}.size();\n".format(i+index);	
			
			//copy
			content += "s{0}.copy();\n".format(i+index);									

			//pick
			content += "s{0}.pick();\n".format(i+index);

			//pop
			content += "s{0}.pop();\n".format(i+index);

			//equals
			content += "s{0}.equals(s{1});\n".format(i+index,i+2-index);	
			content += "s{0}.equals(s{1}.copy());\n".format(i+index,i+index);

		});

	}

	fs.writeFileSync('test.js', content, "utf8");
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}


generateTests();


