class TestService {
  async saveTestResult(testData: any): Promise<{ data: any | null; error: any }> {
    console.log('💾 Test sonucu kaydediliyor:', testData);
    // Mock implementation
    return { data: { id: `test-${Date.now()}` }, error: null };
  }

  async saveTestDetails(testType: string, testResultId: string, details: any): Promise<{ data: any; error: any }> {
    console.log('📊 Test detayları kaydediliyor:', { testType, testResultId, details });
    // Mock implementation
    return { data: { id: `detail-${Date.now()}` }, error: null };
  }

  async saveQuestionResponses(responses: any[]): Promise<{ data: any[] | null; error: any }> {
    console.log('❓ Soru cevapları kaydediliyor:', responses);
    // Mock implementation
    return { data: responses, error: null };
  }
}

export const testService = new TestService();