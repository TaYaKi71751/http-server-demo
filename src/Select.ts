import { Servers } from './Config';
import fetch from 'node-fetch';

export type Response = {
	host: string;
	body?: string;
	error?: Error | string;
};

export function select (
	columns:string | string[],
	table:string
):Promise<Array<Response>> {
	return new Promise((resolve, reject) => {
		const results:Array<Response> = [];
		const promises = Servers.map(async ({ protocol, host, secret }) => {
			fetch(`${protocol}://${host}/select`, {
				method: 'GET',
				headers: { Authorization: secret },
				body: JSON.stringify({ columns, table })
			})
				.catch((error:Error) => {
					results.push({ host, error });
					return undefined;
				})
				.then((response) => (
					(typeof response != 'undefined' && response?.text)
						? (response.text())
						: (response)
				))
				.then((body) => (
					(typeof body == 'string' && body)
						? (results.push({ host, body }))
						: (undefined)
				));
		});
		Promise.all(promises).then((p) => {
			resolve(results);
		});
	});
}
