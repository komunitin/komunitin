class ErrorsManagement {
  // public lastErrors: string[] = null;

  public newError(err: Error, info: string, vm?: Vue): void {
    let lastErrors = [];
    const jLastError = localStorage.getItem('lastErrors') as string | null;
    console.error({
      ErrorManagement: {
        err: err,
        vm: vm,
        info: info
      }
    });

    if (jLastError) {
      lastErrors = JSON.parse(jLastError);
    }
    lastErrors.push(err.message);
    localStorage.setItem('lastErrors', JSON.stringify(lastErrors));
  }

  public getErrors(): string[] | undefined {
    const jLastError = localStorage.getItem('lastErrors') as string | null;
    if (jLastError) {
      const le = JSON.parse(jLastError);
      console.error({ ErrorManagement: le });
      localStorage.removeItem('lastErrors');
      // alert(le);
      return le;
    }
  }
}

export default ErrorsManagement;
