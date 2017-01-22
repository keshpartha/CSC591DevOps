var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var faker = require("faker");
var fs = require("fs");
faker.locale = "en";
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		//args = ["subject.js"];
		args = ["mystery.js"];
	}
	var filePath = args[0];

	constraints(filePath);

	generateTestCases()

}

var engine = Random.engines.mt19937().autoSeed();

function createConcreteIntegerValue( greaterThan, constraintValue )
{
	if( greaterThan )
		return Random.integer(constraintValue,constraintValue+10)(engine);
	else
		return Random.integer(constraintValue-10,constraintValue)(engine);
}

function Constraint(properties)
{
	this.ident = properties.ident;
	this.expression = properties.expression;
	this.operator = properties.operator;
	this.value = properties.value;
	this.altValue = properties.altValue;
	this.altValue2 = properties.altValue2;
	this.altValue3 = properties.altValue3;
	this.altValue4 = properties.altValue4;
	this.altValue5 = properties.altValue5;
	this.funcName = properties.funcName;
	// Supported kinds: "fileWithContent","fileExists"
	// integer, string, phoneNumber
	this.kind = properties.kind;
}

function fakeDemo()
{
	console.log( faker.phone.phoneNumber() );
	console.log( faker.phone.phoneNumberFormat() );
	console.log( faker.phone.phoneFormats() );
}

var functionConstraints =
{
}

var mockFileLibrary = 
{
	pathExists:
	{
		'path/fileExists': {}
	},
	fileWithContent:
	{
		pathContent: 
		{	
  			file1: 'text content',
		}
	},
	directoryWithContent:
	{
		'path/fileExists': 
		{
			file1: 'some content'
		}
	},
	fileWithNoContent:
	{
		pathContent:
		{
			file1: ''
		}
	}
};

function generateTestCases()
{

	//var content = "var subject = require('./subject.js')\nvar mock = require('mock-fs');\n"
	var content = "var subject = require('./mystery.js')\nvar mock = require('mock-fs');\n"
	for ( var funcName in functionConstraints )
	{
		var params = {};
		var altParams = {};
		var altParams2 = {};
		var altParams3 = {};
		var altParams4 = {};
		var altParams5 = {};

		// initialize params
		for (var i =0; i < functionConstraints[funcName].params.length; i++ )
		{
			var paramName = functionConstraints[funcName].params[i];
			//params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
			params[paramName] = '\'\'';
			altParams[paramName] = '\'\'';
			altParams2[paramName] = '\'\'';
			altParams3[paramName] = '\'\'';
			altParams4[paramName] = '\'\'';
			altParams5[paramName] = '\'\'';
		}

		// update parameter values based on known constraints.
		var constraints = functionConstraints[funcName].constraints;
		// Handle global constraints...
		var fileWithContent = _.some(constraints, {kind: 'fileWithContent' });
		var pathExists      = _.some(constraints, {kind: 'fileExists' });
		var directoryWithContent = _.some(constraints, {kind: 'directoryWithContent' });
		var fileWithNoContent = _.some(constraints, {kind: 'fileWithNoContent' });

		var formatFunc = _.some(constraints, {funcName: 'format' });

		// plug-in values for parameters
		for( var c = 0; c < constraints.length; c++ )
		{
			var constraint = constraints[c];
			if( params.hasOwnProperty( constraint.ident ) )
			{
				//console.log(constraint.ident+"");
				params[constraint.ident] = constraint.value;
				altParams[constraint.ident] = constraint.altValue;
				altParams2[constraint.ident] = constraint.altValue2;
				altParams3[constraint.ident] = constraint.altValue3;
				altParams4[constraint.ident] = constraint.altValue4;
				altParams5[constraint.ident] = constraint.altValue5;
			}
		}

		var	args = Object.keys(params).map( function(k) {return params[k]; }).join(",");
		var	altArgs = Object.keys(altParams).map( function(k) {return altParams[k]; }).join(",");
		var	altArgs2 = Object.keys(altParams2).map( function(k) {return altParams2[k]; }).join(",");
		var	altArgs3 = Object.keys(altParams3).map( function(k) {return altParams3[k]; }).join(",");
		var	altArgs4 = Object.keys(altParams4).map( function(k) {return altParams4[k]; }).join(",");
		var	altArgs5 = Object.keys(altParams5).map( function(k) {return altParams5[k]; }).join(",");

		if( pathExists || fileWithContent || directoryWithContent || fileWithNoContent)
		{
			//var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");
			content += generateMockFsTestCases(pathExists,fileWithContent,!directoryWithContent,!fileWithNoContent,funcName, args);
			content += generateMockFsTestCases(pathExists,!fileWithContent,directoryWithContent,!fileWithNoContent,funcName, args);
			content += generateMockFsTestCases(pathExists,!fileWithContent,!directoryWithContent,fileWithNoContent,funcName, args);
			content += generateMockFsTestCases(!pathExists,fileWithContent,directoryWithContent,!fileWithNoContent,funcName, args);
			content += generateMockFsTestCases(!pathExists,fileWithContent,!directoryWithContent,fileWithNoContent,funcName, args);
			content += generateMockFsTestCases(!pathExists,!fileWithContent,directoryWithContent,fileWithNoContent,funcName, args);		
		} 
		else
		{
			// Emit simple test case.
			content += "subject.{0}({1});\n".format(funcName, args );
			content += "subject.{0}({1});\n".format(funcName, altArgs );
			content += "subject.{0}({1});\n".format(funcName, altArgs2 );
			content += "subject.{0}({1});\n".format(funcName, altArgs3 );
			content += "subject.{0}({1});\n".format(funcName, altArgs4 );
			content += "subject.{0}({1});\n".format(funcName, altArgs5 );
		}

	}


	fs.writeFileSync('test.js', content, "utf8");

}

function generateMockFsTestCases (pathExists,fileWithContent,directoryWithContent,fileWithNoContent,funcName,args) 
{
	var testCase = "";
	// Build mock file system based on constraints.
	var mergedFS = {};
	if( pathExists )
	{
		for (var attrname in mockFileLibrary.pathExists) { mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; }
	}
	if( fileWithContent )
	{
		for (var attrname in mockFileLibrary.fileWithContent) { mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname]; }
	}

	if( directoryWithContent )
	{
		for (var attrname in mockFileLibrary.directoryWithContent) { mergedFS[attrname] = mockFileLibrary.directoryWithContent[attrname]; }
	}

	if( fileWithNoContent )
	{
		for (var attrname in mockFileLibrary.fileWithNoContent) { mergedFS[attrname] = mockFileLibrary.fileWithNoContent[attrname]; }
	}

	testCase += 
	"mock(" +
		JSON.stringify(mergedFS)
		+
	");\n";

	testCase += "\tsubject.{0}({1});\n".format(funcName, args );
	testCase+="mock.restore();\n";
	return testCase;
}

function constraints(filePath)
{
   	var buf = fs.readFileSync(filePath, "utf8");
	var result = esprima.parse(buf, options);

	var val, altVal, val2, val3;

	var altVal = '"alt-string"';

	traverse(result, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var funcName = functionName(node);
			console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));

			var params = node.params.map(function(p) {return p.name});

			functionConstraints[funcName] = {constraints:[], params: params};
			// Check for expressions using argument.
			traverse(node, function(child)
			{
				if( child.type === 'BinaryExpression' && (child.operator == "==" || child.operator == "!="))
				{
					if( child.left.type === 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						if (typeof(child.right.value) === 'string') {
						// get expression from original source code:
							var expression = buf.substring(child.range[0], child.range[1]);
							var rightHand = buf.substring(child.right.range[0], child.right.range[1]);
							if (!val) {
								val = rightHand;
							} else if (!val3) {
								val3 = rightHand;
							}
							functionConstraints[funcName].constraints.push( 
								new Constraint(
								{
									ident: child.left.name,
									value: val,
									altValue: altVal,
									altValue2: val2,
									altValue3: altVal,
									altValue4: val3,
									altValue5: val3,
									funcName: funcName,
									kind: "String",
									operator : child.operator,
									expression: expression
								}));
						}
						else {
							// get expression from original source code:
							var expression = buf.substring(child.range[0], child.range[1]);
							var rightHand = buf.substring(child.right.range[0], child.right.range[1])
							functionConstraints[funcName].constraints.push( 
								new Constraint(
								{
									ident: child.left.name,
									value: rightHand,
									altValue: Math.pow(2, 53) - 1,
									altValue2: rightHand,
									altValue3: Math.pow(2, 53) - 1,
									altValue4: rightHand,
									altValue5: rightHand,
									funcName: funcName,
									kind: "integer",
									operator : child.operator,
									expression: expression
								}));
						}
					} 
					else if (child.left.type == 'CallExpression' && child.left.callee.property.name === 'indexOf') {
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = child.left.arguments[0].raw;
						val2 = rightHand;
						altVal2 = '"alt-string"';
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.callee.object.name,
								value: val,
								altValue: altVal,
								altValue2: val2,
								altValue3: altVal,
								altValue4: val3,
								altValue5: altVal,
								funcName: funcName,
								kind: "String",
								operator : child.operator,
								expression: expression
							}));
						}
					else if ( child.left.type === 'Identifier' && child.left.name ) {

						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = child.right.raw;

						var phoneNum = rightHand.substring(0,rightHand.length-1) + '123456"';

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: "phoneNumber",
								value: phoneNum,
								altValue: '\'' + faker.phone.phoneNumber()+'\'',
								altValue2: phoneNum,
								altValue3: '\'' + faker.phone.phoneNumber()+'\'',
								altValue4: phoneNum,
								altValue5: '\'' + faker.phone.phoneNumber()+'\'',
								funcName: funcName,
								kind: "phoneNumber",
								operator : child.operator,
								expression: expression
							}));

					}
				}

				if( child.type === 'BinaryExpression' && child.operator == "<")
				{

					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						var minusOne = parseInt(rightHand)-1+"";
						var plusOne = parseInt(rightHand)+1+"";
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: minusOne,
								altValue: plusOne,
								altValue2: minusOne,
								altValue3: minusOne,
								altValue4: minusOne,
								altValue5: rightHand,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					}
				}

				if( child.type === 'BinaryExpression' && child.operator == ">")
				{
					//console.log(child);
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])


						var plusOne = parseInt(rightHand)+1+"";
						var minusOne = parseInt(rightHand)-1+"";
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: rightHand,
								altValue: minusOne,
								altValue2: minusOne,
								altValue3: minusOne,
								altValue4: plusOne,
								altValue5: rightHand,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					}
				}

				if ( child.type === 'LogicalExpression' && child.operator == '||') {


					console.log(params);
					var expression = buf.substring(child.range[0], child.range[1]);
					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[2],
								value: JSON.stringify({"normalize":true}),
								altValue: JSON.stringify({"normalize":null}),
								altValue2: JSON.stringify({"notNormalize":null}),
								altValue3: JSON.stringify({"notNormalize":true}),
								altValue4: false,
								altValue5: true,
								funcName: funcName,
								kind: params[2],
								operator : child.operator,
								expression: expression
							}));

					functionConstraints[funcName].constraints.push(
					new Constraint(
							{
								ident: params[0],
								value: '\'' + faker.phone.phoneNumber()+'\'',
								altValue: '\'' + faker.phone.phoneNumber()+'\'',
								altValue2: '\'' + faker.phone.phoneNumber()+'\'',
								altValue3: '\'' + faker.phone.phoneNumber()+'\'',
								altValue4: '\'' + faker.phone.phoneNumber()+'\'',
								altValue5: '\'' + faker.phone.phoneNumber()+'\'',
								funcName: funcName,
								kind: params[0],
								operator : child.operator,
								expression: expression
							}));

					functionConstraints[funcName].constraints.push(
					new Constraint(
							{
								ident: params[1],
								value: "'(NNN) NNN-NNNN'",
								altValue: '\'' + faker.phone.phoneFormats()+'\'',
								altValue2: "'(NNN) NNN-NNNN'",
								altValue3: '\'' + faker.phone.phoneFormats()+'\'',
								altValue4: "'(NNN) NNN-NNNN'",
								altValue5: '\'' + faker.phone.phoneFormats()+'\'',
								funcName: funcName,
								kind: params[1],
								operator : child.operator,
								expression: expression
							}));	

					}

				if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="readFileSync" )
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  "'pathContent/file1'",
								funcName: funcName,
								kind: "fileWithNoContent",
								operator : child.operator,
								expression: expression
							}));
						}
					}
				}

				if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="readFileSync" )
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  "'pathContent/file1'",
								funcName: funcName,
								kind: "fileWithContent",
								operator : child.operator,
								expression: expression
							}));
						}
					}
				}

				if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="readFileSync" )
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  "'pathContent/file1'",
								funcName: funcName,
								kind: "directoryWithContent",
								operator : child.operator,
								expression: expression
							}));
						}
					}
				}

				if( child.type == "CallExpression" &&
					 child.callee.property &&
					 child.callee.property.name =="existsSync")
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								// A fake path to a file
								value:  "'path/fileExists'",
								funcName: funcName,
								kind: "fileExists",
								operator : child.operator,
								expression: expression
							}));
						}
					}
				}
			});

			console.log( functionConstraints[funcName]);

		}
	});
}

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

function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "";
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

main();
