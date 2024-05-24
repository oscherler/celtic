export class CelticCanvas
{
	graphics: CanvasRenderingContext2D;
	should_redraw: boolean = true;
	
	grid_width = 5;
	grid_height = 5;
	grid_spacing = 80;
	margin = 80;
	dot_size = 0.075;

	horizontal_walls: number[][] = [
		[ 2, 2 ],
		[ 2, 3 ],
		[ 0.5, 2.5 ],
		[ 3.5, 2.5 ],
	];

	vertical_walls: number[][] = [
		[ 2, 2 ],
		[ 3, 2 ],
		[ 2.5, 0.5 ],
		[ 2.5, 3.5 ],
	];

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
	}

	// TODO: element size
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

		for( var x = 0; x < this.grid_width + 1; x++ )
		{
			this.line( graphics, x, 0, x, this.grid_height );
		}
		
		for( var y = 0; y < this.grid_height + 1; y++ )
		{
			this.line( graphics, 0, y, this.grid_width, y );
		}

		graphics.stroke();
		graphics.closePath();
		*/
		
		// dots

		for( var x = 0; x < this.grid_width + 1; x++ )
		{
			for( var y = 0; y < this.grid_height + 1; y++ )
			{
				this.dot( graphics, x, y, this.dot_size );
				
				if( x > 0 && y > 0 )
				{
					this.dot( graphics, x - 0.5, y - 0.5, this.dot_size );
				}
			}
		}
		
		// walls
				
		graphics.strokeStyle = '#f88';
		graphics.lineWidth = 2;
		graphics.beginPath();

		for( var [ x, y ] of this.horizontal_walls )
		{	
			this.line( graphics, x, y, x + 1, y );
		}

		for( var [ x, y ] of this.vertical_walls )
		{	
			this.line( graphics, x, y, x, y + 1 );
		}

		graphics.stroke();
		graphics.closePath();
		
		// up lines

		graphics.strokeStyle = '#888';
		graphics.lineWidth = 2;
		graphics.beginPath();

		for( var y = 0; y < this.grid_height; y++ )
		{
			for( var x = 0; x < this.grid_width - 1; x++ )
			{
				if( ! this.hasWall( x + 0.5, y + 0.5, x + 1, y ) )
				{
					this.line(
						graphics,
						x + 0.5 + this.dot_size * Math.sqrt(2)/2, y + 0.5 + this.dot_size * Math.sqrt(2)/2,
						x + 1 + this.dot_size * Math.sqrt(2)/2, y + this.dot_size * Math.sqrt(2)/2
					);

					this.line(
						graphics,
						x + 1 - this.dot_size * Math.sqrt(2)/2, y + 1 - this.dot_size * Math.sqrt(2)/2,
						x + 1.5 - this.dot_size * Math.sqrt(2)/2, y + 0.5 - this.dot_size * Math.sqrt(2)/2
					);
				}
			}
		}

		graphics.stroke();
		graphics.closePath();
		
		// down lines

		graphics.strokeStyle = '#888';
		graphics.lineWidth = 2;
		graphics.beginPath();

		for( var y = 0; y < this.grid_height - 1; y++ )
		{
			for( var x = 0; x < this.grid_width; x++ )
			{
				if( ! this.hasWall( x, y + 1, x + 0.5, y + 0.5 ) )
				{
					this.line(
						graphics,
						x + 0.5 - this.dot_size * Math.sqrt(2)/2, y + 0.5 + this.dot_size * Math.sqrt(2)/2,
						x + 1 - this.dot_size * Math.sqrt(2)/2, y + 1 + this.dot_size * Math.sqrt(2)/2
					);

					this.line(
						graphics,
						x + this.dot_size * Math.sqrt(2)/2, y + 1 - this.dot_size * Math.sqrt(2)/2,
						x + 0.5 + this.dot_size * Math.sqrt(2)/2, y + 1.5 - this.dot_size * Math.sqrt(2)/2
					);
				}
			}
		}

		graphics.stroke();
		graphics.closePath();
		
		// frame
		
		graphics.strokeStyle = '#888';
		graphics.lineWidth = 2;
		graphics.beginPath();

		this.line( graphics, 0, 0, this.grid_width, 0 );
		this.line( graphics, this.grid_width, 0, this.grid_width, this.grid_height );
		this.line( graphics, this.grid_width, this.grid_height, 0, this.grid_height );
		this.line( graphics, 0, this.grid_height, 0, 0 );
		
		graphics.stroke();
		graphics.closePath();

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

	hasWall( hx: number, hy: number, vx: number, vy: number ): boolean
	{
		for( let [ x, y ] of this.horizontal_walls )
		{
			if( x == hx && y == hy )
				return true;
		}

		for( let [ x, y ] of this.vertical_walls )
		{
			if( x == vx && y == vy )
				return true;
		}
		
		return false;
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
