/**
 * Azure Functions Entry Point
 * This file imports all function modules to register them with the Azure Functions runtime
 */

// Import all function modules to register them
import './functions/health/healthCheck';
import './functions/candidates/getCandidates';
import './functions/candidates/getCandidateById';
import './functions/candidates/createCandidate';
