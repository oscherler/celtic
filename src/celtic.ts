export class CelticCanvas
{
	graphics: CanvasRenderingContext2D;
	should_redraw: boolean = true;
	
	grid_width = 5;
	grid_height = 5;
	grid_spacing = 80;
	dot_size = 6;

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
			graphics.moveTo( ( x + 1 ) * this.grid_spacing, this.grid_spacing );
			graphics.lineTo( ( x + 1 ) * this.grid_spacing, this.grid_spacing + this.grid_height * this.grid_spacing );
		}
		
		for( var y = 0; y < this.grid_height + 1; y++ )
		{
			graphics.moveTo( this.grid_spacing, ( y + 1 ) * this.grid_spacing );
			graphics.lineTo( this.grid_spacing + this.grid_width * this.grid_spacing, ( y + 1 ) * this.grid_spacing );
		}

		graphics.stroke();
		graphics.closePath();
		*/
		
		// dots

		for( var x = 0; x < this.grid_width + 1; x++ )
		{
			for( var y = 0; y < this.grid_height + 1; y++ )
			{
				this.dot( graphics, ( x + 1 ) * this.grid_spacing, ( y + 1 ) * this.grid_spacing, this.dot_size );
				
				if( x > 0 && y > 0 )
				{
					this.dot( graphics, ( x + 0.5 ) * this.grid_spacing, ( y + 0.5 ) * this.grid_spacing, this.dot_size );
				}
			}
		}
		
		// up lines

		graphics.strokeStyle = '#888';
		graphics.lineWidth = 2;
		graphics.beginPath();

		for( var y = 0; y < this.grid_height; y++ )
		{
			for( var x = 0; x < this.grid_width - 1; x++ )
			{
				graphics.moveTo( ( x + 1.5 ) * this.grid_spacing + this.dot_size * Math.sqrt(2)/2, ( y + 1.5 ) * this.grid_spacing + this.dot_size * Math.sqrt(2)/2 );
				graphics.lineTo( ( x + 2 ) * this.grid_spacing + this.dot_size * Math.sqrt(2)/2, ( y + 1 ) * this.grid_spacing + this.dot_size * Math.sqrt(2)/2 );

				graphics.moveTo( ( x + 2 ) * this.grid_spacing - this.dot_size * Math.sqrt(2)/2, ( y + 2 ) * this.grid_spacing - this.dot_size * Math.sqrt(2)/2 );
				graphics.lineTo( ( x + 2.5 ) * this.grid_spacing - this.dot_size * Math.sqrt(2)/2, ( y + 1.5 ) * this.grid_spacing - this.dot_size * Math.sqrt(2)/2 );
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
				graphics.moveTo( ( x + 1.5 ) * this.grid_spacing - this.dot_size * Math.sqrt(2)/2, ( y + 1.5 ) * this.grid_spacing + this.dot_size * Math.sqrt(2)/2 );
				graphics.lineTo( ( x + 2 ) * this.grid_spacing - this.dot_size * Math.sqrt(2)/2, ( y + 2 ) * this.grid_spacing + this.dot_size * Math.sqrt(2)/2 );

				graphics.moveTo( ( x + 1 ) * this.grid_spacing + this.dot_size * Math.sqrt(2)/2, ( y + 2 ) * this.grid_spacing - this.dot_size * Math.sqrt(2)/2 );
				graphics.lineTo( ( x + 1.5 ) * this.grid_spacing + this.dot_size * Math.sqrt(2)/2, ( y + 2.5 ) * this.grid_spacing - this.dot_size * Math.sqrt(2)/2 );
			}
		}

		graphics.stroke();
		graphics.closePath();
		
		// frame
		
		graphics.strokeStyle = '#888';
		graphics.lineWidth = 2;
		graphics.beginPath();

		graphics.moveTo( this.grid_spacing, this.grid_spacing );
		graphics.lineTo( ( this.grid_width + 1 ) * this.grid_spacing, this.grid_spacing );
		graphics.lineTo( ( this.grid_width + 1 ) * this.grid_spacing, ( this.grid_height + 1 ) * this.grid_spacing );
		graphics.lineTo( this.grid_spacing, ( this.grid_height + 1 ) * this.grid_spacing );
		graphics.lineTo( this.grid_spacing, this.grid_spacing );
		
		graphics.stroke();
		graphics.closePath();

		graphics.strokeStyle = save_stroke;
		graphics.fillStyle = save_fill;
		graphics.lineWidth = save_width;
	}

	dot( graphics: CanvasRenderingContext2D, x, y, r: number )
	{
		graphics.beginPath();
		graphics.arc( x, y, r, 0, 2 * Math.PI );
		graphics.stroke();
		graphics.fill();
		graphics.closePath();
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
