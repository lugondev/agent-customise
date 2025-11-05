#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Time Server MCP...${NC}\n"

# Check if the server is built
if [ ! -f "packages/mcp-servers/time-server/dist/index.js" ]; then
    echo -e "${YELLOW}⚠️  Time server not built. Building now...${NC}"
    cd packages/mcp-servers/time-server
    pnpm install
    pnpm build
    cd ../../..
    echo -e "${GREEN}✅ Time server built successfully${NC}\n"
fi

echo -e "${BLUE}Testing Time Server Tools:${NC}\n"

# Create a temporary test script
cat > /tmp/test-time-mcp.js << 'EOF'
const { spawn } = require('child_process');

const serverPath = process.argv[2];

const tests = [
    {
        name: 'get_current_time (ISO format)',
        request: {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: 'get_current_time',
                arguments: { format: 'iso' }
            }
        }
    },
    {
        name: 'get_current_time (locale format)',
        request: {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
                name: 'get_current_time',
                arguments: { format: 'locale', timezone: 'Asia/Ho_Chi_Minh' }
            }
        }
    },
    {
        name: 'get_timestamp',
        request: {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'get_timestamp',
                arguments: { unit: 'milliseconds' }
            }
        }
    },
    {
        name: 'get_timezone',
        request: {
            jsonrpc: '2.0',
            id: 4,
            method: 'tools/call',
            params: {
                name: 'get_timezone',
                arguments: {}
            }
        }
    },
    {
        name: 'format_time',
        request: {
            jsonrpc: '2.0',
            id: 5,
            method: 'tools/call',
            params: {
                name: 'format_time',
                arguments: {
                    timestamp: Date.now(),
                    format: 'locale'
                }
            }
        }
    }
];

async function runTest(test) {
    return new Promise((resolve, reject) => {
        console.log(`\n📝 Test: ${test.name}`);
        
        const server = spawn('node', [serverPath]);
        let output = '';
        let errorOutput = '';
        
        server.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        server.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        server.on('error', (error) => {
            reject(error);
        });
        
        // Send initialize request first
        const initRequest = {
            jsonrpc: '2.0',
            id: 0,
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: { name: 'test-client', version: '1.0.0' }
            }
        };
        
        server.stdin.write(JSON.stringify(initRequest) + '\n');
        
        // Wait a bit then send the actual test request
        setTimeout(() => {
            server.stdin.write(JSON.stringify(test.request) + '\n');
            
            // Give it time to respond
            setTimeout(() => {
                server.kill();
                
                if (errorOutput) {
                    console.log('Server logs:', errorOutput);
                }
                
                if (output) {
                    try {
                        // Parse JSON-RPC responses
                        const lines = output.trim().split('\n');
                        const responses = lines.map(line => {
                            try {
                                return JSON.parse(line);
                            } catch {
                                return null;
                            }
                        }).filter(Boolean);
                        
                        const testResponse = responses.find(r => r.id === test.request.id);
                        if (testResponse && testResponse.result) {
                            console.log('✅ Success');
                            console.log('Response:', JSON.stringify(testResponse.result, null, 2));
                            resolve(true);
                        } else {
                            console.log('⚠️  No matching response found');
                            resolve(false);
                        }
                    } catch (error) {
                        console.log('❌ Error parsing response:', error.message);
                        resolve(false);
                    }
                } else {
                    console.log('⚠️  No output received');
                    resolve(false);
                }
            }, 1000);
        }, 500);
    });
}

async function runAllTests() {
    console.log('🚀 Starting Time Server MCP Tests\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const result = await runTest(test);
            if (result) passed++;
            else failed++;
        } catch (error) {
            console.log('❌ Test failed:', error.message);
            failed++;
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 Test Summary:`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${tests.length}\n`);
    
    process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
EOF

# Run the test
node /tmp/test-time-mcp.js "$(pwd)/packages/mcp-servers/time-server/dist/index.js"
TEST_RESULT=$?

# Clean up
rm /tmp/test-time-mcp.js

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
else
    echo -e "\n${RED}❌ Some tests failed${NC}"
fi

exit $TEST_RESULT
