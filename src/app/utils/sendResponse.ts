import type { Response } from "express";
import type { IMetaData } from "../interface/interface";

interface IResponse<T> {
	statusCode: number;
	message: string;
	data?: T;
	meta?: IMetaData;
}

const sendResponse = <T>(res: Response, data: IResponse<T>) => {
	res.status(data.statusCode).json({
		success: true,
		message: data.message,
		data: data.data,
		meta: data.meta,
	});
};

export default sendResponse;
