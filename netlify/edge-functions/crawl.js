export default async (req, context) => {
	try {
		const isLocal = req.url.startsWith('http://localhost');
		const search = new URLPattern(req.url).search || '';
		const searchArr = search.split('&').filter(it => it.startsWith('url='));
		if (!searchArr.length) {
			throw new Error('invalid url');
		}
		const searchUrl = searchArr[0].split('=')[1] || '';

		const html = await fetch(decodeURIComponent(searchUrl), {
			'headers': {
				'Content-Type': 'text/plain',
				'User-Agent': req.headers['user-agent'] || ''
			}
		}).then(res => {
			return res.text();
		}).then((data) => {
			return data;
		});
		return new Response(JSON.stringify({ code: 0, html }), {
			headers: {
				'content-type': 'application/json',
				'Access-Control-Allow-Origin': isLocal ? '*' : 'https://www.debug-anywhere.com'
			}
		})
		// return context.json({ code: 0, html: html });
	} catch (e) {
		return new Response(JSON.stringify({ code: 1, msg: e.message }), {
			headers: {
				'content-type': 'application/json',
				'Access-Control-Allow-Origin': isLocal ? '*' : 'https://www.debug-anywhere.com'
			}
		})
		// return context.json({ code: 1, msg: e.message });
	}
}