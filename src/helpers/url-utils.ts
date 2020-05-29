import queryString from "querystring";
import url from "url";

export const getParsedParams = (originalUrl: string) => {
	const parsedUrl = url.parse(originalUrl);
	return queryString.parse(parsedUrl.query);
}

export const getPaginationParams = (originalUrl: string): {startPos: number, limit: number} => {
	const parsedQs = getParsedParams(originalUrl);
	const startPos = parsedQs && parsedQs.startPos && Array.isArray(parsedQs.startPos)
		? parseInt(parsedQs.startPos.join(''))
		: parsedQs && parsedQs.startPos && !Array.isArray(parsedQs.startPos)
			? parseInt(parsedQs.startPos)
			: undefined;
	const limit = parsedQs && parsedQs.limit && Array.isArray(parsedQs.limit)
		? parseInt(parsedQs.limit.join(''))
		: parsedQs && parsedQs.limit && !Array.isArray(parsedQs.limit)
			? parseInt(parsedQs.limit)
			: undefined;
	return {startPos: startPos, limit: limit};
}
