/* Mobilny screenshot przez CDP z Emulation.setDeviceMetricsOverride (omija min-width okna). */
const { spawn } = require( 'child_process' );
const http = require( 'http' );
const fs = require( 'fs' );
const WebSocket = require( 'ws' );

const W = parseInt( process.argv[ 2 ] || '390', 10 );
const H = parseInt( process.argv[ 3 ] || '844', 10 );
const URL_TO_TEST = process.argv[ 4 ] || 'http://localhost/atonce/';
const OUT = process.argv[ 5 ] || 'cdp-mobile.png';
const FULL = process.argv[ 6 ] === 'full';
const PORT = 9224;

const chrome = spawn(
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	[ '--headless=new', '--disable-gpu', `--remote-debugging-port=${ PORT }`,
		'--user-data-dir=/tmp/cdp-shot-profile', 'about:blank' ],
	{ stdio: 'ignore' }
);
const wait = ( ms ) => new Promise( ( r ) => setTimeout( r, ms ) );
const getTargets = () =>
	new Promise( ( resolve, reject ) => {
		http.get( `http://127.0.0.1:${ PORT }/json`, ( res ) => {
			let d = '';
			res.on( 'data', ( c ) => ( d += c ) );
			res.on( 'end', () => resolve( JSON.parse( d ) ) );
		} ).on( 'error', reject );
	} );

( async () => {
	let targets;
	for ( let i = 0; i < 30; i++ ) {
		await wait( 300 );
		try { targets = await getTargets(); if ( targets && targets.length ) break; } catch ( e ) {}
	}
	const page = targets.find( ( t ) => t.type === 'page' );
	const ws = new WebSocket( page.webSocketDebuggerUrl );
	let id = 0; const pending = {};
	const send = ( method, params = {} ) =>
		new Promise( ( resolve ) => { const mid = ++id; pending[ mid ] = resolve; ws.send( JSON.stringify( { id: mid, method, params } ) ); } );
	ws.on( 'message', ( raw ) => { const m = JSON.parse( raw ); if ( m.id && pending[ m.id ] ) { pending[ m.id ]( m.result ); delete pending[ m.id ]; } } );
	await new Promise( ( r ) => ws.on( 'open', r ) );

	await send( 'Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true } );
	await send( 'Page.enable' );
	await send( 'Page.navigate', { url: URL_TO_TEST } );
	await wait( 3000 );

	let clip;
	if ( FULL ) {
		const metrics = await send( 'Page.getLayoutMetrics' );
		const height = Math.min( Math.ceil( metrics.cssContentSize.height ), 8000 );
		await send( 'Emulation.setDeviceMetricsOverride', { width: W, height, deviceScaleFactor: 2, mobile: true } );
		await wait( 800 );
		clip = { x: 0, y: 0, width: W, height, scale: 1 };
	}
	const shot = await send( 'Page.captureScreenshot', { format: 'png', ...( clip ? { clip } : {} ) } );
	fs.writeFileSync( OUT, Buffer.from( shot.data, 'base64' ) );
	console.log( 'saved', OUT );
	chrome.kill();
	process.exit( 0 );
} )().catch( ( e ) => { console.error( e ); chrome.kill(); process.exit( 1 ); } );
