var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var astring = require('astring');
var recursive = require('recursive-readdir');

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["lib/simplesets.js"];
		//args = ["analysis.js"];
	}
	var filePath = args[0];
	
	complexity(filePath);

	// Report
	for( var node in builders )
	{
		var builder = builders[node];
		builder.report();
	}

	console.log("Long Methods: ")
	console.log(longFunction('lib/simplesets.js'));
	//console.log(longFunction('analysis.js'));

	console.log("\n");
	detectTokens();

}

function detectTokens() {

	 recursive('.',  ['node_modules', '.git', '.gitignore', '.DS_Store', 'coverage' ], function (err, fileNames) {		
  		fileNames.forEach(function (file) {

  			if (file.substr(file.length-4,file.length) === ".pem") {
  				console.log(file+" You may be commiting a keyfile. Please check.")
  			} 

  			fs.readFile(file, 'utf8', function(err, data) {
  				if (String(data).match(/\"AKI[a-zA-Z0-9]{17,18}\"/) || String(data).match(/\"[a-zA-Z0-9]{64}\"/)) {
  				console.log(file+" You may be commiting a file with a security token or API key.")
  				}
  			});
  		});
	});
}

var longFunction = function(filePath){
	var funlines={};
	var buf = fs.readFileSync(filePath, "utf8");
	var lines = buf.split("\n");
	var i=0;
	while(i < lines.length) {
		if(lines[i].indexOf('function(')!=-1){
			var functionname=lines[i].substring(0,lines[i].indexOf('function')-1).trim().replace(':','').replace('=','').replace('exports.','');
			var openbrace=1;
			var linestart=i;
			var comments=0;
			one: while(openbrace>0){
				i++;
				if(lines[i].trim().indexOf("//")==0 || lines[i].trim()==""){
					comments++;
					continue one;
				}
				var temp1=lines[i].split('{');
				if(temp1.length>1)
					openbrace=openbrace+temp1-1;
				var temp2=lines[i].split('}');
				if(temp2.length>1)
					openbrace=openbrace-temp2+1;
			}
			var count=i-linestart+1-comments;
			if(count>6)
				funlines["Line: "+linestart+" - "+functionname]=count;
		}
		i++;
	};
	return funlines;
}

var builders = {};

// Represent a reusable "class" following the Builder pattern.
function ComplexityBuilder()
{
	this.StartLine = 0;
	this.FunctionName = "";
	// The number of parameters for functions
	this.ParameterCount  = 0,
	// Number of if statements/loops + 1
	this.SimpleCyclomaticComplexity = 0;
	// The max depth of scopes (nested ifs, loops, etc)
	this.MaxNestingDepth    = 0;
	// The max number of conditions if one decision statement.
	this.MaxConditions      = 0;

	this.ImportStatements = 0;

	this.IsDuplicate = false;

	this.report = function()
	{
		console.log(
		   (
		   	"{0}(): {1}\n" +
		   	"============\n" +
				"MaxConditions: {2}\n\n" +
				"IsDuplicate: {3}\n\n"
			)
			.format(this.FunctionName, this.StartLine,
			        this.MaxConditions, this.IsDuplicate)
		);
	}
};

// A function following the Visitor pattern. Provide current node to visit and function that is evaluated at each node.
function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
            	child.parent = object;
					traverseWithParents(child, visitor);
            }
        }
    }
}


// A function following the Visitor pattern but allows canceling transversal if visitor returns false.
function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function complexity(filePath)
{
	var buf = fs.readFileSync(filePath, "utf8");
	var ast = esprima.parse(buf, options);

	var packageComplexity = new ComplexityBuilder();
	builders["packageComplexity"] = packageComplexity;
	var i = 0;
	function_obj=[];
	// Tranverse program with a function visitor.
	traverseWithParents(ast, function (node) 
	{
		function checkDuplicate(body,function_obj){
			var dup=false;
			for (var i = function_obj.length - 1; i >= 0; i--) {
				if(astring(body, {indent: ' ',lineEnd: '\n'})==astring(function_obj[i], {indent: ' ',lineEnd: '\n'}))
					return true;
			};
			return false;
		}
		if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') 
		{
			var builder = new ComplexityBuilder();

			builder.FunctionName = functionName(node);
			builder.StartLine    = node.loc.start.line;
			builder.ParameterCount = node.params.length;
			builder.IsDuplicate = checkDuplicate(node.body,function_obj);
			function_obj.push(node.body);

			traverseWithParents(node, function (child)
			{
				//console.log(child.type);

				var maxcount = 0;

				if ( child.type == 'IfStatement') {
					var leftCount = 0, rightCount = 0, count = 0;

					if (child.test.type != 'LogicalExpression') {
						count = 1;
					} 
					else {

						if (child.test.left) {
					 		leftCount = findNumberofConditions(child.test.left)
						}

						if (child.test.right) {
					 		rightCount = findNumberofConditions(child.test.right);
						}

						count = leftCount+rightCount;

					}
					if (count > maxcount) {
							maxcount = count;
					}
					builder.MaxConditions = maxcount;
				}
				
			});

			function findNumberofConditions(child) {

				if (!child ) {
					return 0;
				}

				if (child.type != 'LogicalExpression') {
					return 1;
				} 
				else {
					var leftCount = 0, rightCount = 0;
					//console.log(child);
					if (child.left) {
					 	leftCount = findNumberofConditions(child.left)
					}

					if (child.right) {
					 	rightCount = findNumberofConditions(child.right);
					}

					return leftCount+rightCount;
				}
			}

			builders[builder.FunctionName] = builder
		}



	});



}

// Helper function for counting children of node.
function childrenLength(node)
{
	var key, child;
	var count = 0;
	for (key in node) 
	{
		if (node.hasOwnProperty(key)) 
		{
			child = node[key];
			if (typeof child === 'object' && child !== null && key != 'parent') 
			{
				count++;
			}
		}
	}	
	return count;
}


// Helper function for checking if a node is a "decision type node"
function isDecision(node)
{
	if( node.type == 'IfStatement' )
	{
		// Don't double count else/else if
		if( node.parent && node.parent.type == 'IfStatement' && node.parent["alternate"] )
		{
			return false;
		}
		return true;
	}

	if( node.type == 'ForStatement' || node.type == 'WhileStatement' ||
		 node.type == 'ForInStatement' || node.type == 'DoWhileStatement')
	{
		return true;
	}
	return false;
}

// Helper function for printing out function name.
function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "anon function @" + node.loc.start.line;
}

// Helper function for allowing parameterized formatting of strings.
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

main();

function Crazy (argument) 
{

	var date_bits = element.value.match(/^(\d{4})\-(\d{1,2})\-(\d{1,2})$/);
	var new_date = null;
	if(date_bits && date_bits.length == 4 && parseInt(date_bits[2]) > 0 && parseInt(date_bits[3]) > 0)
    new_date = new Date(parseInt(date_bits[1]), parseInt(date_bits[2]) - 1, parseInt(date_bits[3]));

    var secs = bytes / 3500;

      if ( secs < 59 )
      {
          return secs.toString().split(".")[0] + " seconds";
      }
      else if ( secs > 59 && secs < 3600 )
      {
          var mints = secs / 60;
          var remainder = parseInt(secs.toString().split(".")[0]) -
(parseInt(mints.toString().split(".")[0]) * 60);
          var szmin;
          if ( mints > 1 )
          {
              szmin = "minutes";
          }
          else
          {
              szmin = "minute";
          }
          return mints.toString().split(".")[0] + " " + szmin + " " +
remainder.toString() + " seconds";
      }
      else
      {
          var mints = secs / 60;
          var hours = mints / 60;
          var remainders = parseInt(secs.toString().split(".")[0]) -
(parseInt(mints.toString().split(".")[0]) * 60);
          var remainderm = parseInt(mints.toString().split(".")[0]) -
(parseInt(hours.toString().split(".")[0]) * 60);
          var szmin;
          if ( remainderm > 1 )
          {
              szmin = "minutes";
          }
          else
          {
              szmin = "minute";
          }
          var szhr;
          if ( remainderm > 1 )
          {
              szhr = "hours";
          }
          else
          {
              szhr = "hour";
              for ( i = 0 ; i < cfield.value.length ; i++)
				  {
				    var n = cfield.value.substr(i,1);
				    if ( n != 'a' && n != 'b' && n != 'c' && n != 'd'
				      && n != 'e' && n != 'f' && n != 'g' && n != 'h'
				      && n != 'i' && n != 'j' && n != 'k' && n != 'l'
				      && n != 'm' && n != 'n' && n != 'o' && n != 'p'
				      && n != 'q' && n != 'r' && n != 's' && n != 't'
				      && n != 'u' && n != 'v' && n != 'w' && n != 'x'
				      && n != 'y' && n != 'z'
				      && n != 'A' && n != 'B' && n != 'C' && n != 'D'
				      && n != 'E' && n != 'F' && n != 'G' && n != 'H'
				      && n != 'I' && n != 'J' && n != 'K' && n != 'L'
				      && n != 'M' && n != 'N' &&  n != 'O' && n != 'P'
				      && n != 'Q' && n != 'R' && n != 'S' && n != 'T'
				      && n != 'U' && n != 'V' && n != 'W' && n != 'X'
				      && n != 'Y' && n != 'Z'
				      && n != '0' && n != '1' && n != '2' && n != '3'
				      && n != '4' && n != '5' && n != '6' && n != '7'
				      && n != '8' && n != '9'
				      && n != '_' && n != '@' && n != '-' && n != '.' )
				    {
				      window.alert("Only Alphanumeric are allowed.\nPlease re-enter the value.");
				      cfield.value = '';
				      cfield.focus();
				    }
				    cfield.value =  cfield.value.toUpperCase();
				  }
				  return;
          }
          return hours.toString().split(".")[0] + " " + szhr + " " +
mints.toString().split(".")[0] + " " + szmin;
      }
  }
 