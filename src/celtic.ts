export class CelticCanvas
{
	graphics: CanvasRenderingContext2D;
	should_redraw: boolean = true;
	
	grid_width = 6;
	grid_height = 4;
	grid_spacing = 40;
	margin = 10;
	dot_size = 0.15;
	
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
		const rect = canvas.getBoundingClientRect();

		// increase the actual size of our canvas
		canvas.width = rect.width * scale;
		canvas.height = rect.height * scale;
		// scale everything down using CSS
		canvas.style.width = rect.width + 'px';
		canvas.style.height = rect.height + 'px';

		if( canvas.getContext )
		{

			const graphics = canvas.getContext('2d');

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
		this.dx = this.p2g( event.layerX );
		this.dy = this.p2g( event.layerY );

		this.forceRedraw();
	}
	
	onMouseUp( event: MouseEvent )
	{
		this.toggleWall( this.p2g( event.layerX ), this.p2g( event.layerY ) );

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
		graphics.beginPath();

		for( var x = 0; x < this.grid_width + 1; x += 2 )
		{
			this.line( graphics, x, 0, x, this.grid_height );
		}
		
		for( var y = 0; y < this.grid_height + 1; y += 2 )
		{
			this.line( graphics, 0, y, this.grid_width, y );
		}

		graphics.stroke();
		graphics.closePath();
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
		graphics.beginPath();

		for( var [ x, y ] of this.horizontal_walls.walls )
		{	
			this.line( graphics, x, y, x + 2, y );
		}

		for( var [ x, y ] of this.vertical_walls.walls )
		{	
			this.line( graphics, x, y, x, y + 2 );
		}

		graphics.stroke();
		graphics.closePath();
		*/
		
		// segments
		
		graphics.strokeStyle = '#00f';
		graphics.lineWidth = 2;
		
		graphics.beginPath();

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
						/* this.line( graphics, x + n,   y - n,   x + n/2, y - n/2 );
						this.line( graphics, x + n/2, y - n/2, x + n/2, y + n/2 );
						this.line( graphics, x + n/2, y + n/2, x + n,   y + n   ); */

						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
						graphics.arc( this.g2p( x + r ), this.g2p( y + 1 - r ), r * this.grid_spacing, 3 * Math.PI / 4, Math.PI );
						graphics.arc( this.g2p( x + r ), this.g2p( y - 1 + r ), r * this.grid_spacing, Math.PI, 5 * Math.PI / 4 );
						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
						graphics.arc( this.g2p( x + 1 ), this.g2p( y ), this.dot_size * this.grid_spacing, 3 * Math.PI / 4, 5 * Math.PI / 4 );
						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
					}
					
					if( wallRight )
					{
						/* this.line( graphics, x - n,   y - n,   x - n/2, y - n/2 );
						this.line( graphics, x - n/2, y - n/2, x - n/2, y + n/2 );
						this.line( graphics, x - n/2, y + n/2, x - n,   y + n   ); */

						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
						graphics.arc( this.g2p( x - r ), this.g2p( y - 1 + r ), r * this.grid_spacing, 7 * Math.PI / 4, 2 * Math.PI );
						graphics.arc( this.g2p( x - r ), this.g2p( y + 1 - r ), r * this.grid_spacing, 0, Math.PI / 4 );
						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
						graphics.arc( this.g2p( x - 1 ), this.g2p( y ), this.dot_size * this.grid_spacing, - Math.PI / 4, Math.PI / 4 );
						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
					}

					if( wallBelow )
					{
						/* this.line( graphics, x - n,   y - n,   x - n/2, y - n/2 );
						this.line( graphics, x - n/2, y - n/2, x + n/2, y - n/2 );
						this.line( graphics, x + n/2, y - n/2, x + n,   y - n   ); */

						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
						graphics.arc( this.g2p( x + 1 - r ), this.g2p( y - r ), r * this.grid_spacing, Math.PI / 4, Math.PI / 2 );
						graphics.arc( this.g2p( x - 1 + r ), this.g2p( y - r ), r * this.grid_spacing, Math.PI / 2, 3 * Math.PI / 4,  );
						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
						graphics.arc( this.g2p( x ), this.g2p( y - 1 ), this.dot_size * this.grid_spacing, Math.PI / 4, 3 * Math.PI / 4 );
						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
					}

					if( wallAbove )
					{
						/* this.line( graphics, x - n,   y + n,   x - n/2, y + n/2 );
						this.line( graphics, x - n/2, y + n/2, x + n/2, y + n/2 );
						this.line( graphics, x + n/2, y + n/2, x + n,   y + n   ); */
						

						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
						graphics.arc( this.g2p( x - 1 + r ), this.g2p( y + r ), r * this.grid_spacing, 5 * Math.PI / 4, 3 * Math.PI / 2 );
						graphics.arc( this.g2p( x + 1 - r ), this.g2p( y + r ), r * this.grid_spacing, 3 * Math.PI / 2, 7 * Math.PI / 4,  );
						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
						graphics.arc( this.g2p( x ), this.g2p( y + 1 ), this.dot_size * this.grid_spacing, 5 * Math.PI / 4, 7 * Math.PI / 4 );
						graphics.stroke();
						graphics.closePath();

						graphics.beginPath();
					}
					
					if( ! wallLeft && ! wallRight && ! wallAbove && ! wallBelow )
					{
						if( y % 2 == 0 )
						{
							// down
							// this.line( graphics, x - n,     y - n,     x + n,     y + n     );

							this.line( graphics, x - m,     y - 1 + m, x + 1 - m, y + m     );
							this.line( graphics, x - 1 + m, y - m,     x + m,     y + 1 - m );

							// TODO: this one is empirical
							this.line( graphics, x - 1 + m,     y + m,         x - 1 + 2 * m, y             );
							this.line( graphics, x,             y - 1 + 2 * m, x + m,         y - 1 + m     );
							this.line( graphics, x - m,         y + 1 - m,     x,             y + 1 - 2 * m );
							this.line( graphics, x + 1 - 2 * m, y,             x + 1 - m,     y - m         );
						}
						else
						{
							// up
							// this.line( graphics, x - n,     y + n,     x + n,     y - n     );

							this.line( graphics, x - 1 + m, y + m,     x + m,     y - 1 + m );
							this.line( graphics, x - m,     y + 1 - m, x + 1 - m, y - m     );

							// TODO: this one is empirical
							this.line( graphics, x - 1 + m,     y - m,         x - 1 + 2 * m, y             );
							this.line( graphics, x,             y + 1 - 2 * m, x + m,         y + 1 - m     );
							this.line( graphics, x - m,         y - 1 + m,     x,             y - 1 + 2 * m );
							this.line( graphics, x + 1 - 2 * m, y,             x + 1 - m,     y + m         );
						}
					}
				}
			}
		}

		graphics.stroke();
		graphics.closePath();

		// frame

		/*
		graphics.strokeStyle = '#888';
		graphics.lineWidth = 2;
		graphics.beginPath();

		this.line( graphics, 0, 0, this.grid_width, 0 );
		this.line( graphics, this.grid_width, 0, this.grid_width, this.grid_height );
		this.line( graphics, this.grid_width, this.grid_height, 0, this.grid_height );
		this.line( graphics, 0, this.grid_height, 0, 0 );
		
		graphics.stroke();
		graphics.closePath();
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
		
				graphics.beginPath();
				this.line( graphics, wallX, Math.max( 0, wallY ), wallX, Math.min( this.grid_height, wallY + 2 ) );
				graphics.stroke();
				graphics.closePath();
			}
			else if( Math.abs( wallY - this.dy ) < 0.2 && wallY > 0 && wallY < this.grid_height )
			{
				// horizontal wall
				if( wallY % 2 == 0 )
					wallX = 2 * Math.floor( this.dx / 2 );
				else
					wallX = 2 * Math.floor( ( this.dx - 1 ) / 2 ) + 1;
		
				graphics.beginPath();
				this.line( graphics, Math.max( 0, wallX ), wallY, Math.min( this.grid_width, wallX + 2 ), wallY );
				graphics.stroke();
				graphics.closePath();
			}
		}
		
		graphics.strokeStyle = save_stroke;
		graphics.fillStyle = save_fill;
		graphics.lineWidth = save_width;
	}

	line( graphics: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number )
	{
		graphics.moveTo( this.g2p( x1 ), this.g2p( y1 ) );
		graphics.lineTo( this.g2p( x2 ), this.g2p( y2 ) );
	}

	dot( graphics: CanvasRenderingContext2D, x: number, y: number, r: number )
	{
		graphics.beginPath();
		graphics.arc( this.g2p( x ), this.g2p( y ), r * this.grid_spacing, 0, 2 * Math.PI );
		graphics.stroke();
		graphics.fill();
		graphics.closePath();
	}
	
	g2p( x: number ): number
	{
		return this.margin + x * this.grid_spacing;
	}

	p2g( x: number ): number
	{
		return ( x - this.margin ) / this.grid_spacing;
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
	
	toggleWall( x: number, y: number )
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
