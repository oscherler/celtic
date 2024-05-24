export class CelticCanvas
{
	graphics: CanvasRenderingContext2D;
	should_redraw: boolean = true;

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

		const save_color = graphics.strokeStyle;
		
		graphics.strokeStyle = 'black';
		graphics.beginPath();

		graphics.moveTo(  10,  10 );
		graphics.lineTo(  10, 100 );
		graphics.lineTo( 100, 100 );
		graphics.lineTo( 100,  10 );
		graphics.lineTo(  10,  10 );
		
		graphics.stroke();
		graphics.closePath();

		graphics.strokeStyle = save_color;
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
