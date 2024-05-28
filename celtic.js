function main( celtic )
{
	const canvas = document.getElementById('canvas');

	const celtic_canvas = new celtic.CelticCanvas( canvas, window.devicePixelRatio );

	celtic_canvas.repaint();

	const widthInput = document.getElementById('width');

	const heightInput = document.getElementById('height');

	widthInput.onchange = ev => {
		let value = 2 * ev.target.value;
		
		if( value <= 0 || value > 20 )
		{
			ev.target.value = celtic_canvas.grid_width / 2;

			return false;
		}
		
		celtic_canvas.grid_width = 2 * ev.target.value;
		celtic_canvas.forceRedraw();
	}

	heightInput.onchange = ev => {
		let value = 2 * ev.target.value;
		
		if( value <= 0 || value > 20 )
		{
			ev.target.value = celtic_canvas.grid_height / 2;

			return false;
		}

		celtic_canvas.grid_height = 2 * ev.target.value;
		celtic_canvas.forceRedraw();
	}
}
