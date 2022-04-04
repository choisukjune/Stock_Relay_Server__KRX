//----------------------------------------------------------------------------------------------------;
var fileNm = "Server/index.js";
if( console ) console.log( "[ S ] - " + fileNm + "----------" );
//----------------------------------------------------------------------------------------------------;
//-------------------------------------------------------;
// REQUIRE;
//-------------------------------------------------------;

var cp = require( "child_process" );
var fs = require('fs');
var http = require('http');
var path = require('path');
var WebSocket = require('ws');

//-------------------------------------------------------;
// VARIABLE;
//-------------------------------------------------------;
// 정리해야함 ---- 생각나는데로 하고있음.....;
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;

global.server = {};
global.server.addRouter = function(a,b){ return global.ROUTER_LIST[ a ] = b; };

//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;

global.ROUTER_LIST = {};

//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;


global.CONST = {};
global.CONST.MongoDB = {};
global.CONST.MongoDB.OPTIONS = {
	"self" : { ID : "admin", PWD : "tjrwns2482", HOST : "localhost", PORT : 59320 }	
};

//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;

var CWD = global.process.cwd();
var server_port = 8886;

var ROUTER_DIRECTORY_PATH = CWD + "/js/";

global.Stock = {};
global.Stock.BasicInfo = {};

//router등록을 한다.
(function(){
	var ROUTER_FILE_LIST = fs.readdirSync( ROUTER_DIRECTORY_PATH );
	var i =0,iLen = ROUTER_FILE_LIST.length,io;
	for(;i<iLen;++i){
		//라우터를 등록한다;
		eval( fs.readFileSync( ROUTER_DIRECTORY_PATH + ROUTER_FILE_LIST[ i ] ).toString() );
	}
})();
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;

//-------------------------------------------------------;
// LOGIC;
//-------------------------------------------------------;
onload = function(){
	
	var webview = document.querySelector('webview')
	
	webview.addEventListener('did-finish-load', () => {

	//webview.loadURL( "https://m.stock.naver.com" );
	global.getStockInfo = function(date,cbFunction){
		webview.executeJavaScript(`

		new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest();
			var param = "bld=dbms/MDC/STAT/standard/MDCSTAT01501&locale=ko_KR&mktId=ALL&trdDd=${date}&share=1&money=1&csvxls_isNo=false"

			xhr.onload = function() {
			  if (xhr.status === 200 || xhr.status === 201) {
				resolve( xhr.responseText )
			  } else {
				console.error(xhr.responseText);
			  }
			};

			xhr.open('POST', 'http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd');
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhr.send(param);
		});

		`
		).then(function(data){
			

			var _forder_root = "./data/sise/";
			var _forder_root_bak = "./data/sise/" + date + "/bak/";
			var _forder_root_csv = "./data/sise/" + date + "/csv/";
			var _forder_root_json = "./data/sise/" +date + "/json/";
			
			fs.mkdirSync( _forder_root + date,{ recursive : true }  );

			fs.mkdirSync( _forder_root_bak,{ recursive : true } );
			fs.mkdirSync( _forder_root_csv,{ recursive : true }  );
			fs.mkdirSync( _forder_root_json,{ recursive : true }  );


			//여기서처리해야함
			console.log( JSON.parse( data ) )
			fs.writeFileSync( _forder_root_csv + date + ".json", data, {flag:"w"} )
			cbFunction( data );
		})
	}

	global.getAllStockInfo = function(cbFunction){
		webview.executeJavaScript(`

		new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest();
			var param = "bld=dbms/MDC/STAT/standard/MDCSTAT01901&locale=ko_KR&mktId=ALL&share=1&csvxls_isNo=false"

			xhr.onload = function() {
			  if (xhr.status === 200 || xhr.status === 201) {
				resolve( xhr.responseText )
			  } else {
				console.error(xhr.responseText);
			  }
			};

			xhr.open('POST', 'http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd');
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhr.send(param);
		});

		`
		).then(function(data){
			
			//여기서처리해야함
			var _tmp = JSON.parse( data );


			console.log( _tmp )
			
			var i = 0,iLen=_tmp.OutBlock_1.length,io
			for(;i<iLen;++i){
				io = _tmp.OutBlock_1[ i ];
				global.Stock.BasicInfo[ io.ISU_SRT_CD ] = io;
			}
			cbFunction( global.Stock.BasicInfo );
		})
	}

	global.getAgencyInfo = function(cd,date,cbFunction){
		
		var param00 = encodeURIComponent( cd + "/" + global.Stock.BasicInfo[ cd ].ISU_ABBRV )
		var param01 = encodeURIComponent( global.Stock.BasicInfo[ cd ].ISU_ABBRV )
		var cd00 = global.Stock.BasicInfo[ cd ].ISU_CD;
		var cd01 = global.Stock.BasicInfo[ cd ].ISU_CD;
		var date =  date || "20220128"

		webview.executeJavaScript(`

		new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest();
			var param = "bld=dbms/MDC/STAT/standard/MDCSTAT02301&locale=ko_KR&inqTpCd=1&trdVolVal=2&askBid=3&tboxisuCd_finder_stkisu0_2=${param00}&isuCd=${cd00}&isuCd2=${cd01}&codeNmisuCd_finder_stkisu0_2=%EC%B9%B4%EC%B9%B4%EC%98%A4&param1isuCd_finder_stkisu0_2=ALL&strtDd=${date}&endDd=${date}&share=1&money=1&csvxls_isNo=false"

			xhr.onload = function() {
			  if (xhr.status === 200 || xhr.status === 201) {
				resolve( xhr.responseText )
			  } else {
				console.error(xhr.responseText);
			  }
			};

			xhr.open('POST', 'http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd');
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhr.send(param);
		});

		`
		).then(function(data){
			
			//여기서처리해야함
			console.log( JSON.parse( data ) )
			cbFunction( data );
		})
	}
	

	global.getAllAgencyInfoByDaily = function( date ){

		var _forder_root = "./data/agency/";
		var _forder_root_bak = "./data/agency/" + date + "/bak/";
		var _forder_root_csv = "./data/agency/" + date + "/csv/";
		var _forder_root_json = "./data/agency/" +date + "/json/";
		
		fs.mkdirSync( _forder_root + date,{recursive : true} );

		fs.mkdirSync( _forder_root_bak,{recursive : true} );
		fs.mkdirSync( _forder_root_csv,{recursive : true} );
		fs.mkdirSync( _forder_root_json,{recursive : true} );

		var cd = global.getAllAgencyInfoByDaily.keyArr[ global.getAllAgencyInfoByDaily.cnt ];
		console.log( cd );
		global.getAgencyInfo( cd,date,function(d){
			fs.writeFileSync( "./data/agency/" + date + "/csv/" + cd + ".json",d,{flag : "w"} )
			if( global.getAllAgencyInfoByDaily.keyArr.length - 1 == global.getAllAgencyInfoByDaily.cnt )
			{
				console.log( "end" )
				return;
			}
			else
			{
				++global.getAllAgencyInfoByDaily.cnt;
				//setTimeout(function(){
					global.getAllAgencyInfoByDaily( date );
				//},1000)
				
			}
		} )
	}

	global.getAllAgencyInfoByDaily.init = function(){
		if( Object.keys( global.Stock.BasicInfo ).length > 0 )
		{
			console.log( "global.Stock.BasicInfo is Loaded!" )
			global.getAllAgencyInfoByDaily.cnt = 0;
			global.getAllAgencyInfoByDaily.keyArr = Object.keys( global.Stock.BasicInfo )	
		}
		else
		{
			console.log( "global.Stock.BasicInfo is not Load!" )
			setTimeout(function(){
				global.getAllAgencyInfoByDaily.init();
			},1000)
		}
	}
	
	global.getAllAgencyInfoByDaily.init();

	
	

	global.server = http.createServer(function(req, res){

		req.on('error', function( err ){
			console.error(err);
			res.statusCode = 400;
			res.end('400: Bad Request');
			return;
		});

		res.on('error', function( err ){ console.error(err); });
		

		//var routerNm = req.url.replace(/\//,"");
		var routerNm = req.url.split("?")[0];
		
		
		if( req.url == "/" )
		{
			res.end( JSON.stringify( fs.readdirSync( ROUTER_DIRECTORY_PATH ) ) );
		}
		else if( global.ROUTER_LIST[ routerNm ] )
		{
			res.statusCode = 200;
			global.ROUTER_LIST[ routerNm ]( req, res );
		}
		else
		{
			var filePath = '.' + req.url.split("?")[0];
			console.log( filePath );
			var extname = path.extname(filePath);
			
			var _oContentTypes = {
				'.html' : "text/html"
				, '.js' : 'text/javascript'
				, '.css' : 'text/css'
				, '.json' : 'application/json'
				, '.png' : 'image/png'
				, '.jpg' : 'image/jpg'
				, '.wav' : 'audio/wav'
			};
			var contentType = _oContentTypes[ extname ];
			
			fs.readFile(filePath, function(error, content) {
				if(error)
				{
					if(error.code == 'ENOENT')
					{
						res.statusCode = 404;
						res.end('404: File Not Found');
					}
					else
					{
						res.writeHead(500);
						res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
						res.end(); 
					}
				}
				else
				{
					
					res.writeHead(200, { 'Content-Type': contentType });
					res.end(content, 'utf-8');
				}
			});
		}

		return;

	})


	//--------------------------------------------------;
	//--------------------------------------------------;
	//--------------------------------------------------;
	//--------------------------------------------------;
	//--------------------------------------------------;
	//웹소켓연결부분;

	global.wss = new WebSocket.Server({ server : global.server });
	global.ws = {};
	global.ws.clients = {};
	global.wss.on('connection', function connection( ws ) {

	  ws.on('message', function incoming( message ){
		console.log('received: %s', message);
	  });
	   ws.on('close', function close() {
		console.log('disconnected SOCKET - PORT : 5000');
	  });
	  //var r = {	type : "connection", data : id };
	  //global.ws.send( JSON.stringify( r ) );
	});
	//--------------------------------------------------;
	//--------------------------------------------------;
	//--------------------------------------------------;
	//--------------------------------------------------;
	//--------------------------------------------------;
	//--------------------------------------------------;

	global.server.listen( server_port );
	
	//Stock-기본정보로드;
	global.getAllStockInfo(function(d){ console.log("Basic Data Load Complete!")  });

	})
}


//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
//----------------------------------------------------------------------------------------------------;
if( console ) console.log( "[ E ] - " + fileNm + "----------" );
//----------------------------------------------------------------------------------------------------;