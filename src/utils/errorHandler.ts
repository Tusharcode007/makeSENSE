export const handleError = (error: any): { status: number; message: string } => {
  console.error('[Error]:', error);
  if (error?.status) {
    return { status: error.status, message: error.message };
  }
  return { status: 500, message: 'An unexpected error occurred in MakeSense AI.' };
};
