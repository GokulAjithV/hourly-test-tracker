import type { EngineeringRequest } from '../services/api.ts';
import { ApiService } from '../services/api.ts'

const mockEngineeringRequest: EngineeringRequest = {
    paths: [
        "V:\\workspace\\business\\hourly-test-tracker\\test-and-reference-files\\csv-test-files\\TSP_Production_Data_20250620_1.csv",
        // "V:\\workspace\\business\\hourly-test-tracker\\test-and-reference-files\\csv-test-files\\TSP_Production_Data_20250620_2.csv",
        // "V:\\workspace\\business\\hourly-test-tracker\\test-and-reference-files\\csv-test-files\\TSP_Production_Data_20250620_3.csv",
        // "V:\\workspace\\business\\hourly-test-tracker\\test-and-reference-files\\csv-test-files\\TSP_Production_Data_20250620_4.csv",
        // "V:\\workspace\\business\\hourly-test-tracker\\test-and-reference-files\\csv-test-files\\TSP_Production_Data_20260102_1.csv"
    ]
}

//Test EngineeringDataFetch 
async function testEngineeringData() {
    console.log('Testing fetchEngineeringData...');
    console.log('Request: ', mockEngineeringRequest);

    try {
        const startTime = Date.now();
        const data = await ApiService.fetchEngineeringData(mockEngineeringRequest);
        const endTime = Date.now();

        console.log('Response Success ✅');
        console.log(`Response Time - ${endTime - startTime}ms`);
        console.log(`Records Length : ${data.length}`);
        console.log(`Sample Result Data: `, data.slice(0, 3));
        
        return data;
    } catch (error) {
        console.error('Error fetching csv records: ', error);
        throw error;
    }
}

//Test all Fetch APIs
export async function runAllApiTests() {
    console.log('Running all API tests...\n');

    try {
        await testEngineeringData();
    } catch (error) {
        console.error('\n❌ Test suite failed: ', error);
    }
}

runAllApiTests();