export class CelticCanvas
{
	graphics: CanvasRenderingContext2D;
	should_redraw: boolean = true;
	
	grid_width = 6;
	grid_height = 4;
	grid_spacing = 40;
	margin = 10;
	dot_size = 0.15;
	
	canvas: HTMLCanvasElement
	dx: number = 0;
	dy: number = 0;

	horizontal_walls: WallSet = new WallSet( [
	] );

	vertical_walls: WallSet = new WallSet( [
		[ 2, 0 ],
		[ 4, 2 ],
	] );

	constructor( canvas: HTMLCanvasElement, scale )
	{
		this.canvas = canvas;
		
		let bb = this.canvas.getBoundingClientRect();

		// increase the actual size of our canvas
		this.canvas.width = bb.width * scale;
		this.canvas.height = bb.height * scale;
		// scale everything down using CSS
		this.canvas.style.width = bb.width + 'px';
		this.canvas.style.height = bb.height + 'px';

		if( this.canvas.getContext )
		{

			const graphics = this.canvas.getContext('2d');

			// ensure all drawing operations are scaled
			graphics.scale( scale, scale );

			if( graphics )
				this.graphics = graphics;
			else
				throw Error();
		}
		
		let self = this;
		this.canvas.addEventListener( "mousemove", ev => self.onMouseMove( ev ) );
		this.canvas.addEventListener( "mouseup", ev => self.onMouseUp( ev ) );
	}

	onMouseMove( event: MouseEvent )
	{
		[ this.dx, this.dy ] = this.p2g( this.v2p( [ event.clientX, event.clientY ] ) );

		this.forceRedraw();
	}
	
	onMouseUp( event: MouseEvent )
	{
		this.toggleWall( this.p2g( this.v2p( [ event.clientX, event.clientY ] ) ) );

		this.forceRedraw();
	}
	
	getSize()
	{
		return this.graphics.canvas.getBoundingClientRect();
	}

	forceRedraw()
	{
		this.should_redraw = true;
		this.repaint();
	}
	
	// from Java Canvas?
	repaint()
	{
		this.graphics.clearRect( 0, 0, this.getSize().width, this.getSize().height );
		this.update( this.graphics );
	}
		
	paint( graphics: CanvasRenderingContext2D )
	{
		graphics.clearRect( 0, 0, this.getSize().width, this.getSize().height );

		const save_stroke = graphics.strokeStyle;
		const save_fill = graphics.fillStyle;
		const save_width = graphics.lineWidth;

		graphics.strokeStyle = '#aaa';
		graphics.fillStyle = '#fff';

		// grid

		/*
		this.stroke( graphics, ( g ) => {
			for( var x = 0; x < this.grid_width + 1; x += 2 )
			{
				this.line( g, x, 0, x, this.grid_height );
			}
			
			for( var y = 0; y < this.grid_height + 1; y += 2 )
			{
				this.line( g, 0, y, this.grid_width, y );
			}
		} );
		*/
		
		// dots

		for( var x = 0; x < this.grid_width + 1; x += 2 )
		{
			for( var y = 0; y < this.grid_height + 1; y += 2 )
			{
				this.dot( graphics, x, y, this.dot_size );
				
				if( x > 0 && y > 0 )
				{
					this.dot( graphics, x - 1, y - 1, this.dot_size );
				}
			}
		}
		
		// walls
		
		/*
		graphics.strokeStyle = '#f88';
		graphics.lineWidth = 2;

		this.stroke( graphics, ( g ) => {
			for( var [ x, y ] of this.horizontal_walls.walls )
			{	
				this.line( graphics, x, y, x + 2, y );
			}

			for( var [ x, y ] of this.vertical_walls.walls )
			{	
				this.line( graphics, x, y, x, y + 2 );
			}
		} );
		*/
		
		// segments
		
		graphics.strokeStyle = '#00f';
		graphics.lineWidth = 2;
		
		let n = Math.sqrt(2)/2 - this.dot_size
		let m = this.dot_size * Math.sqrt(2)/2;
		let r = ( 1 + Math.sqrt(2) ) * this.dot_size;

		for( var x = 0; x < this.grid_width + 1; x++ )
		{
			for( var y = 0; y < this.grid_height + 1; y++ )
			{
				if( x % 2 != y % 2 )
				{
					let wallLeft = this.hasWallLeft( x, y - 1 );
					let wallRight = this.hasWallRight( x, y - 1 );
					let wallAbove = this.hasWallAbove( x - 1, y );
					let wallBelow = this.hasWallBelow( x - 1, y );

					if( wallLeft )
					{
						/* this.stroke( graphics, ( g ) => {
							this.line( g, x + n,   y - n,   x + n/2, y - n/2 );
							this.line( g, x + n/2, y - n/2, x + n/2, y + n/2 );
							this.line( g, x + n/2, y + n/2, x + n,   y + n   );
						} ); */

						this.stroke( graphics, ( g ) => {
							this.arc( g, x + r, y + 1 - r, r, 3 * Math.PI / 4, Math.PI );
							this.arc( g, x + r, y - 1 + r, r, Math.PI, 5 * Math.PI / 4 );
						} );

						this.stroke( graphics, ( g ) => {
							this.arc( g, x + 1, y, this.dot_size, 3 * Math.PI / 4, 5 * Math.PI / 4 );
						} );
					}
					
					if( wallRight )
					{
						/* this.stroke( graphics, ( g ) => {
							this.line( g, x - n,   y - n,   x - n/2, y - n/2 );
							this.line( g, x - n/2, y - n/2, x - n/2, y + n/2 );
							this.line( g, x - n/2, y + n/2, x - n,   y + n   );
						} ); */

						this.stroke( graphics, ( g ) => {
							this.arc( g, x - r, y - 1 + r, r, 7 * Math.PI / 4, 2 * Math.PI );
							this.arc( g, x - r, y + 1 - r, r, 0, Math.PI / 4 );
						} );

						this.stroke( graphics, ( g ) => {
							this.arc( g, x - 1, y, this.dot_size, - Math.PI / 4, Math.PI / 4 );
						} );
					}

					if( wallBelow )
					{
						/* this.stroke( graphics, ( g ) => {
							this.line( g, x - n,   y - n,   x - n/2, y - n/2 );
							this.line( g, x - n/2, y - n/2, x + n/2, y - n/2 );
							this.line( g, x + n/2, y - n/2, x + n,   y - n   );
						} ); */

						this.stroke( graphics, ( g ) => {
							this.arc( g, x + 1 - r, y - r, r, Math.PI / 4, Math.PI / 2 );
							this.arc( g, x - 1 + r, y - r, r, Math.PI / 2, 3 * Math.PI / 4,  );
						} );

						this.stroke( graphics, ( g ) => {
							this.arc( g, x, y - 1, this.dot_size, Math.PI / 4, 3 * Math.PI / 4 );
						} );
					}

					if( wallAbove )
					{
						/* this.stroke( graphics, ( g ) => {
							this.line( g, x - n,   y + n,   x - n/2, y + n/2 );
							this.line( g, x - n/2, y + n/2, x + n/2, y + n/2 );
							this.line( g, x + n/2, y + n/2, x + n,   y + n   );
						} ); */

						this.stroke( graphics, ( g ) => {
							this.arc( g, x - 1 + r, y + r, r, 5 * Math.PI / 4, 3 * Math.PI / 2 );
							this.arc( g, x + 1 - r, y + r, r, 3 * Math.PI / 2, 7 * Math.PI / 4,  );
						} );

						this.stroke( graphics, ( g ) => {
							this.arc( g, x, y + 1, this.dot_size, 5 * Math.PI / 4, 7 * Math.PI / 4 );
						} );
					}
					
					if( ! wallLeft && ! wallRight && ! wallAbove && ! wallBelow )
					{
						if( y % 2 == 0 )
						{
							this.stroke( graphics, ( g ) => {
								// down
								// this.line( g, x - n,     y - n,     x + n,     y + n     );

								this.line( g, x - m,     y - 1 + m, x + 1 - m, y + m     );
								this.line( g, x - 1 + m, y - m,     x + m,     y + 1 - m );

								// TODO: this one is empirical
								this.line( g, x - 1 + m,     y + m,         x - 1 + 2 * m, y             );
								this.line( g, x,             y - 1 + 2 * m, x + m,         y - 1 + m     );
								this.line( g, x - m,         y + 1 - m,     x,             y + 1 - 2 * m );
								this.line( g, x + 1 - 2 * m, y,             x + 1 - m,     y - m         );
							} );
						}
						else
						{
							this.stroke( graphics, ( g ) => {
								// up
								// this.line( g, x - n,     y + n,     x + n,     y - n     );

								this.line( g, x - 1 + m, y + m,     x + m,     y - 1 + m );
								this.line( g, x - m,     y + 1 - m, x + 1 - m, y - m     );

								// TODO: this one is empirical
								this.line( g, x - 1 + m,     y - m,         x - 1 + 2 * m, y             );
								this.line( g, x,             y + 1 - 2 * m, x + m,         y + 1 - m     );
								this.line( g, x - m,         y - 1 + m,     x,             y - 1 + 2 * m );
								this.line( g, x + 1 - 2 * m, y,             x + 1 - m,     y + m         );
							} );
						}
					}
				}
			}
		}

		// frame

		/*
		graphics.strokeStyle = '#888';
		graphics.lineWidth = 2;

		this.stroke( graphics, ( g ) => {
			this.line( g, 0, 0, this.grid_width, 0 );
			this.line( g, this.grid_width, 0, this.grid_width, this.grid_height );
			this.line( g, this.grid_width, this.grid_height, 0, this.grid_height );
			this.line( g, 0, this.grid_height, 0, 0 );
		} );
		*/

		// wall highlight

		graphics.strokeStyle = '#f00';
		graphics.fillStyle = '#fff';
		graphics.lineWidth = 3;
		
		if( this.dx >= 0 && this.dx <= this.grid_width && this.dy >= 0 && this.dy <= this.grid_height )
		{
			var wallX = Math.round( this.dx );
			var wallY = Math.round( this.dy );
			
			if( Math.abs( wallX - this.dx ) < 0.2 && wallX > 0 && wallX < this.grid_width )
			{
				// vertical wall
				if( wallX % 2 == 0 )
					wallY = 2 * Math.floor( this.dy / 2 );
				else
					wallY = 2 * Math.floor( ( this.dy - 1 ) / 2 ) + 1;
		
				this.stroke( graphics, ( g ) => {
					this.line( g, wallX, Math.max( 0, wallY ), wallX, Math.min( this.grid_height, wallY + 2 ) );
				} );
			}
			else if( Math.abs( wallY - this.dy ) < 0.2 && wallY > 0 && wallY < this.grid_height )
			{
				// horizontal wall
				if( wallY % 2 == 0 )
					wallX = 2 * Math.floor( this.dx / 2 );
				else
					wallX = 2 * Math.floor( ( this.dx - 1 ) / 2 ) + 1;
		
				this.stroke( graphics, ( g ) => {
					this.line( g, Math.max( 0, wallX ), wallY, Math.min( this.grid_width, wallX + 2 ), wallY );
				} );
			}
		}
		
		graphics.strokeStyle = save_stroke;
		graphics.fillStyle = save_fill;
		graphics.lineWidth = save_width;
	}

	line( graphics: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number )
	{
		let [ p1x, p1y ] = this.g2p( [ x1, y1 ] );
		let [ p2x, p2y ] = this.g2p( [ x2, y2 ] );
		
		graphics.moveTo( p1x, p1y );
		graphics.lineTo( p2x, p2y );
	}

	dot( graphics: CanvasRenderingContext2D, x: number, y: number, r: number )
	{
		graphics.beginPath();
		this.arc( graphics, x, y, r, 0, 2 * Math.PI );
		graphics.stroke();
		graphics.fill();
		graphics.closePath();
	}
	
	arc( graphics: CanvasRenderingContext2D, x: number, y: number, r: number, start: number, end: number )
	{
		let [ px, py ] = this.g2p( [ x, y ] );
		
		graphics.arc( px, py, r * this.grid_spacing, start, end );
	}
	
	stroke( graphics: CanvasRenderingContext2D, operations: ( graphics: CanvasRenderingContext2D ) => void )
	{
		graphics.beginPath();
		operations( graphics );
		graphics.stroke();
		graphics.closePath();
	}
	
	// convert viewport coordinates to canvas pixel coordinates
	v2p( [ vx, vy ]: number[] ): number[]
	{
		let bb = this.canvas.getBoundingClientRect();

		const px = Math.floor( ( vx - bb.left) / bb.width * this.canvas.width );
		const py = Math.floor( ( vy - bb.top) / bb.height * this.canvas.height );
		
		return [ px, py ];
	}
	
	// convert knot grid coordinates to canvas pixel coordinates
	g2p( [ gx, gy ]: number[] ): number[]
	{
		return [
			this.margin + gx * this.grid_spacing,
			this.margin + gy * this.grid_spacing
		];
	}

	// convert canvas pixel coordinates to knot grid coordinates
	p2g( [ px, py ]: number[] ): number[]
	{
		return [
			( px - this.margin ) / this.grid_spacing,
			( py - this.margin ) / this.grid_spacing
		];
	}

	hasWall( hx: number, hy: number, vx: number, vy: number ): boolean
	{
		if( this.horizontal_walls.has( hx, hy ) )
			return true;
		else if( this.vertical_walls.has( vx, vy ) )
			return true;
		
		return false;
	}

	hasWallAbove( hx: number, hy: number ): boolean
	{
		if( hy >= this.grid_height || hx >= this.grid_width - 1 )
			return false;
		
		return hy == 0 || this.horizontal_walls.has( hx, hy );
	}

	hasWallBelow( hx: number, hy: number ): boolean
	{
		if( hy <= 0 || hx >= this.grid_width - 1 )
			return false;
		
		return hy == this.grid_height || this.horizontal_walls.has( hx, hy );
	}

	hasWallLeft( vx: number, vy: number ): boolean
	{
		if( vx >= this.grid_width || vy >= this.grid_height - 1 )
			return false;
		
		return vx == 0 || this.vertical_walls.has( vx, vy );
	}

	hasWallRight( vx: number, vy: number ): boolean
	{
		if( vx <= 0 || vy >= this.grid_height - 1 )
			return false;

		return vx == this.grid_width || this.vertical_walls.has( vx, vy );
	}
	
	toggleWall( [ x, y ]: number[] )
	{		
		if( x >= 0 && x <= this.grid_width && y >= 0 && y <= this.grid_height )
		{
			var wallX = Math.round( x );
			var wallY = Math.round( y );
			
			if( Math.abs( wallX - x ) < 0.2 && wallX > 0 && wallX < this.grid_width )
			{
				// vertical wall
				if( wallX % 2 == 0 )
					wallY = 2 * Math.floor( y / 2 );
				else
					wallY = 2 * Math.floor( ( y - 1 ) / 2 ) + 1;
				
				this.vertical_walls.toggle( wallX, wallY );
			}
			else if( Math.abs( wallY - y ) < 0.2 && wallY > 0 && wallY < this.grid_height )
			{
				// horizontal wall
				if( wallY % 2 == 0 )
					wallX = 2 * Math.floor( x / 2 );
				else
					wallX = 2 * Math.floor( ( x - 1 ) / 2 ) + 1;
		
				this.horizontal_walls.toggle( wallX, wallY );
			}
		}
	}

	update( graphics: CanvasRenderingContext2D )
    {
		// TODO: see if we want an offscreen buffer
		if( this.should_redraw )
		{
			this.paint( graphics );
			this.should_redraw = false;
		}
    }
}

class WallSet
{
	walls: number[][] = []
	
	constructor( walls: number[][] )
	{
		this.walls = walls;
	}
	
	has( x: number, y: number ): boolean
	{
		for( let [ wallX, wallY ] of this.walls )
		{
			if( x == wallX && y == wallY )
				return true;
		}
		
		return false;
	}
	
	toggle( x: number, y: number ): boolean
	{
		for( let [ i, [ wallX, wallY ] ] of this.walls.entries() )
		{
			if( x == wallX && y == wallY )
			{
				// splice does the opposite of what its name means
				this.walls.splice( i, 1 );
				
				return false;
			}
		}
		
		this.walls.push( [ x, y ] );
		
		return true;
	}
}
