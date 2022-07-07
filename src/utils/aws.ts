import { AWSError } from 'aws-sdk';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';

import {
    APIGatewayEvent,
    SQSEvent,
} from '../types/aws';

export interface ErrorResponse {
    error: {
        type: string;
        status: string;
        message?: string;
        payload?: unknown;
    };
}

export class APIGatewayResponseClass<TBody> {
    statusCode: number;

    body: TBody;

    headers: { [key: string]: string };

    isBase64Encoded: boolean;

    constructor({
        statusCode = 200,
        body,
        headers = {},
        isBase64Encoded = false,
    }: {
        body: TBody;
        statusCode?: number;
        headers?: { [key in string]: string };
        isBase64Encoded?: boolean;
    }) {
        this.statusCode = statusCode;
        this.body = body;
        this.headers = headers;
        this.isBase64Encoded = isBase64Encoded;
    }

    toJSON(): {
        statusCode: number;
        body: string;
        headers: { [key: string]: string };
        isBase64Encoded: boolean;
    } {
        return {
            statusCode: this.statusCode,
            body:
                typeof this.body === 'string' ? this.body : JSON.stringify(this.body),
            headers: this.headers,
            isBase64Encoded: this.isBase64Encoded,
        };
    }
}

export type APIGatewayResponse<T> =
    | T
    | APIGatewayResponseClass<T | ErrorResponse>;

export type ResponsePayload<T> = T extends APIGatewayResponse<infer TPayload>
    ? TPayload
    : never;

export function isAPIGatewayEvent<T>(event: {
    [key: string]: any;
}): event is APIGatewayEvent<T> {
    return 'resource' in event;
}

export function isSQSEvent<T>(event: {
    [key: string]: any;
}): event is SQSEvent<T> {
    return 'Records' in event;
}

export type AWSErrorCode =
    | 'ConditionalCheckFailedException'
    | 'TransactionCanceledException'
    | 'UsernameExistsException'
    | 'UserNotFoundException'
    | 'AliasExistsException';

// Cannot use "instanceof AWSError" since AWSError isn't backed by an actual JS class
// and is erased after the compilation
// https://github.com/aws/aws-sdk-js/issues/2611
export function isAWSError(e: Error, errorType?: AWSErrorCode): e is AWSError {
    return 'code' in e && (!errorType || (e as AWSError).code === errorType);
}

export function isDDBConditionalCheckFailedError(e: Error): e is AWSError {
    return isAWSError(e) && e.code === 'ConditionalCheckFailedException';
}

export function isDDBTransactionCancelledError(e: Error): e is AWSError {
    return isAWSError(e) && e.code === 'TransactionCanceledException';
}

export function isCFNEvent(event: {
    [key: string]: any;
}): event is CloudFormationCustomResourceEvent {
    return 'LogicalResourceId' in event;
}
