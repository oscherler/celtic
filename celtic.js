function main( celtic )
{
	const canvas = document.getElementById('canvas');

	const celtic_canvas = new celtic.CelticCanvas( canvas, window.devicePixelRatio );

	celtic_canvas.repaint();
}
