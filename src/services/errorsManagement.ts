class ErrorsManagement {
  // public lastErrors: string[] = null;

  public newError(err: Error, info: string, vm?: Vue): void {
    let lastErrors = [];
    console.error({
      ErrorManagement: {
        err: err,
        vm: vm,
        info: info
      }
    });
    if (localStorage.getItem('lastErrors')) {
      // @ts-ignore
      lastErrors = JSON.parse(localStorage.getItem('lastErrors'));
    }
    lastErrors.push(err.message);
    localStorage.setItem('lastErrors', JSON.stringify(lastErrors));
  }

  public getErrors(): string[] | undefined {
    if (localStorage.getItem('lastErrors')) {
      // @ts-ignore
      const le = JSON.parse(localStorage.getItem('lastErrors'));
      console.error({ ErrorManagement: le });
      localStorage.removeItem('lastErrors');
      // alert(le);
      return le;
    }
  }
}

export default ErrorsManagement;