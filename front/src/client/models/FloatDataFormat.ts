/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FloatDataFormat = {
    endianess?: FloatDataFormat.endianess;
    order?: FloatDataFormat.order;
    compress?: ('gzip' | 'zlib' | null);
    type?: FloatDataFormat.type;
};

export namespace FloatDataFormat {

    export enum endianess {
        LITTLE = 'little',
        BIG = 'big',
    }

    export enum order {
        C = 'C',
        F = 'F',
    }

    export enum type {
        FLOAT16 = 'float16',
        FLOAT32 = 'float32',
        FLOAT64 = 'float64',
    }


}
