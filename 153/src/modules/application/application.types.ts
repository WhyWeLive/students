export type ApplicationEnvironment = {
    Variables: {}
};

export type ApplicationResult<T> = ApplicationSuccessResult<T> | ApplicationFailedResult;

export type ApplicationSuccessResult<T> = {
    success: true;
    data: T;
}

export type ApplicationFailedResult = {
    success: false;
    error: string;
}