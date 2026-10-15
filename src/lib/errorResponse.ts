export interface ErrorBody {
	success: false;
	error: { type: string; message: string; details?: unknown };
}

export function errorBody(
	type: string,
	message: string,
	details?: unknown,
): ErrorBody {
	return {
		success: false,
		error: details===undefined? { type,message }:{ type,message,details },
	};
}