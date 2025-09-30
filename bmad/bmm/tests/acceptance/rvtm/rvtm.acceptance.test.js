/**
 * RVTM (Requirements Verification Traceability Matrix) Acceptance Tests
 *
 * Following ATDD (Acceptance Test-Driven Development) best practices:
 * - Written in business language
 * - Focus on user value and outcomes
 * - Test complete user journeys
 * - Verify acceptance criteria from the epic
 */

const { describe, it, beforeEach, afterEach, before, after } = require('mocha');
const { expect } = require('chai');
const fs = require('fs-extra');
const path = require('path');
const sinon = require('sinon');

// Import modules to be tested (will be implemented after tests are written)
const RVTMManager = require('../../../../core/lib/rvtm/rvtm-manager');
const CoverageCalculator = require('../../../../core/lib/rvtm/coverage-calculator');
const ReportGenerator = require('../../../../core/lib/rvtm/report-generator');

// Test constants
const TEST_PROJECT_ROOT = path.join(__dirname, 'test-project');
const TEST_RVTM_PATH = path.join(TEST_PROJECT_ROOT, '.rvtm');

describe('RVTM Implementation - Epic Acceptance Tests', () => {

  // Test setup and teardown
  beforeEach(async () => {
    // Create clean test directory
    await fs.ensureDir(TEST_PROJECT_ROOT);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(TEST_PROJECT_ROOT);
  });

  /**
   * STORY 1: Initialize RVTM for New Project
   * As a Project Manager
   * I want to initialize an RVTM structure for my project
   * So that I can track all requirements from inception
   */
  describe('Story 1: Initialize RVTM for New Project', () => {
    let rvtmManager;

    beforeEach(() => {
      rvtmManager = new RVTMManager(TEST_PROJECT_ROOT);
    });

    it('should create RVTM directory structure when initialized', async () => {
      // Given: A new project without RVTM
      expect(await fs.pathExists(TEST_RVTM_PATH)).to.be.false;

      // When: I initialize RVTM
      await rvtmManager.initialize();

      // Then: Complete RVTM directory structure should be created
      expect(await fs.pathExists(TEST_RVTM_PATH)).to.be.true;
      expect(await fs.pathExists(path.join(TEST_RVTM_PATH, 'config.yaml'))).to.be.true;
      expect(await fs.pathExists(path.join(TEST_RVTM_PATH, 'matrix.json'))).to.be.true;
      expect(await fs.pathExists(path.join(TEST_RVTM_PATH, 'requirements'))).to.be.true;
      expect(await fs.pathExists(path.join(TEST_RVTM_PATH, 'stories'))).to.be.true;
      expect(await fs.pathExists(path.join(TEST_RVTM_PATH, 'tests'))).to.be.true;
      expect(await fs.pathExists(path.join(TEST_RVTM_PATH, 'reports'))).to.be.true;
      expect(await fs.pathExists(path.join(TEST_RVTM_PATH, 'history'))).to.be.true;
    });

    it('should set initial configuration with defaults', async () => {
      // When: I initialize RVTM
      await rvtmManager.initialize();

      // Then: Configuration should contain default values
      const config = await rvtmManager.getConfiguration();
      expect(config.version).to.equal('1.0.0');
      expect(config.settings.require_links).to.be.true;
      expect(config.settings.auto_update).to.be.true;
      expect(config.settings.coverage_threshold).to.equal(90);
    });

    it('should import existing PRDs when present', async () => {
      // Given: Existing PRD documents in the project
      const prdPath = path.join(TEST_PROJECT_ROOT, 'docs', 'prd');
      await fs.ensureDir(prdPath);
      await fs.writeFile(
        path.join(prdPath, 'test-prd.md'),
        '# Test PRD\n\n## Requirements\n- REQ-001: User authentication\n- REQ-002: Data persistence'
      );

      // When: I initialize RVTM
      await rvtmManager.initialize({ importExisting: true });

      // Then: Requirements should be imported from PRDs
      const requirements = await rvtmManager.getRequirements();
      expect(requirements).to.have.lengthOf(2);
      expect(requirements[0].id).to.equal('REQ-001');
      expect(requirements[0].text).to.include('User authentication');
      expect(requirements[1].id).to.equal('REQ-002');
      expect(requirements[1].text).to.include('Data persistence');
    });

    it('should generate baseline report after initialization', async () => {
      // When: I initialize RVTM
      await rvtmManager.initialize();

      // Then: A baseline report should be generated
      const reportPath = path.join(TEST_RVTM_PATH, 'reports', 'latest', 'baseline.md');
      expect(await fs.pathExists(reportPath)).to.be.true;

      const report = await fs.readFile(reportPath, 'utf-8');
      expect(report).to.include('RVTM Baseline Report');
      expect(report).to.include('Total Requirements: 0');
      expect(report).to.include('Project initialized');
    });
  });

  /**
   * STORY 2: Link Story to Requirements
   * As a Developer
   * I want to link my story to specific requirements
   * So that we maintain implementation traceability
   */
  describe('Story 2: Link Story to Requirements', () => {
    let rvtmManager;

    beforeEach(async () => {
      rvtmManager = new RVTMManager(TEST_PROJECT_ROOT);
      await rvtmManager.initialize();

      // Add test requirements
      await rvtmManager.addRequirement({
        id: 'REQ-001',
        text: 'User authentication system',
        priority: 'critical',
        source_document: 'PRD-AUTH-001'
      });
      await rvtmManager.addRequirement({
        id: 'REQ-002',
        text: 'Password reset functionality',
        priority: 'high',
        source_document: 'PRD-AUTH-001'
      });
    });

    it('should prompt for requirement links during story creation', async () => {
      // Given: A story creation workflow
      const storyData = {
        id: 'STORY-001',
        title: 'Implement login form',
        sprint: 'Sprint 1',
        developer: 'john.doe'
      };

      // When: Creating a story without requirement links
      const result = await rvtmManager.createStory(storyData);

      // Then: Should return validation error
      expect(result.success).to.be.false;
      expect(result.error).to.include('requirement links are required');
    });

    it('should allow linking multiple requirements to one story', async () => {
      // Given: A story that implements multiple requirements
      const storyData = {
        id: 'STORY-001',
        title: 'Implement authentication module',
        requirements: ['REQ-001', 'REQ-002'],
        sprint: 'Sprint 1',
        developer: 'john.doe'
      };

      // When: Creating the story with requirement links
      const result = await rvtmManager.createStory(storyData);

      // Then: Story should be linked to both requirements
      expect(result.success).to.be.true;
      const story = await rvtmManager.getStory('STORY-001');
      expect(story.requirements).to.have.lengthOf(2);
      expect(story.requirements).to.include('REQ-001');
      expect(story.requirements).to.include('REQ-002');
    });

    it('should prevent stories without requirement links when validation enabled', async () => {
      // Given: RVTM configured to require links
      await rvtmManager.updateConfiguration({
        settings: { require_links: true }
      });

      // When: Attempting to create story without requirements
      const storyData = {
        id: 'STORY-002',
        title: 'Refactor database layer',
        sprint: 'Sprint 2'
      };

      // Then: Should fail validation
      await expect(rvtmManager.createStory(storyData))
        .to.be.rejectedWith('Stories must be linked to at least one requirement');
    });

    it('should automatically update RVTM matrix when story is linked', async () => {
      // Given: Initial RVTM state
      const initialMatrix = await rvtmManager.getMatrix();
      expect(initialMatrix.links).to.have.lengthOf(0);

      // When: Creating story with requirement links
      await rvtmManager.createStory({
        id: 'STORY-003',
        title: 'Build user profile API',
        requirements: ['REQ-001'],
        sprint: 'Sprint 1'
      });

      // Then: Matrix should contain the new trace link
      const updatedMatrix = await rvtmManager.getMatrix();
      expect(updatedMatrix.links).to.have.lengthOf(1);
      expect(updatedMatrix.links[0]).to.deep.include({
        from_type: 'story',
        from_id: 'STORY-003',
        to_type: 'requirement',
        to_id: 'REQ-001',
        link_type: 'implements'
      });
    });
  });

  /**
   * STORY 3: Map Tests to Requirements
   * As a QA Engineer
   * I want to map my tests to requirements
   * So that we can verify coverage
   */
  describe('Story 3: Map Tests to Requirements', () => {
    let rvtmManager;
    let coverageCalculator;

    beforeEach(async () => {
      rvtmManager = new RVTMManager(TEST_PROJECT_ROOT);
      coverageCalculator = new CoverageCalculator(rvtmManager);
      await rvtmManager.initialize();

      // Setup requirements and stories
      await rvtmManager.addRequirement({
        id: 'REQ-001',
        text: 'User login',
        priority: 'critical'
      });
      await rvtmManager.addRequirement({
        id: 'REQ-002',
        text: 'Session management',
        priority: 'high'
      });
      await rvtmManager.createStory({
        id: 'STORY-001',
        title: 'Login implementation',
        requirements: ['REQ-001', 'REQ-002']
      });
    });

    it('should allow tests to be linked to multiple requirements', async () => {
      // Given: A test that verifies multiple requirements
      const testData = {
        id: 'TEST-001',
        type: 'integration',
        name: 'User authentication flow',
        requirements: ['REQ-001', 'REQ-002'],
        stories: ['STORY-001']
      };

      // When: Creating the test with mappings
      await rvtmManager.addTest(testData);

      // Then: Test should be linked to both requirements
      const test = await rvtmManager.getTest('TEST-001');
      expect(test.requirements).to.have.lengthOf(2);
      expect(test.requirements).to.include.members(['REQ-001', 'REQ-002']);
    });

    it('should support different test types (unit, integration, E2E, user journey)', async () => {
      // Given: Tests of different types
      const testTypes = [
        { id: 'TEST-U01', type: 'unit', name: 'Password validator' },
        { id: 'TEST-I01', type: 'integration', name: 'Auth API test' },
        { id: 'TEST-E01', type: 'e2e', name: 'Login flow E2E' },
        { id: 'TEST-UJ01', type: 'user_journey', name: 'Complete signup journey' }
      ];

      // When: Adding tests with different types
      for (const test of testTypes) {
        await rvtmManager.addTest({
          ...test,
          requirements: ['REQ-001']
        });
      }

      // Then: All test types should be stored correctly
      const tests = await rvtmManager.getTests();
      expect(tests).to.have.lengthOf(4);

      const types = tests.map(t => t.type);
      expect(types).to.include.members(['unit', 'integration', 'e2e', 'user_journey']);
    });

    it('should automatically calculate coverage metrics', async () => {
      // Given: Requirements with partial test coverage
      await rvtmManager.addTest({
        id: 'TEST-002',
        type: 'unit',
        requirements: ['REQ-001'],
        status: 'passed'
      });

      // When: Calculating coverage
      const coverage = await coverageCalculator.calculateCoverage();

      // Then: Coverage metrics should be accurate
      expect(coverage.total_requirements).to.equal(2);
      expect(coverage.tested_requirements).to.equal(1);
      expect(coverage.coverage_percentage).to.equal(50);
      expect(coverage.requirements['REQ-001'].covered).to.be.true;
      expect(coverage.requirements['REQ-002'].covered).to.be.false;
    });

    it('should identify orphaned tests without requirement links', async () => {
      // Given: Tests without requirement links
      await rvtmManager.addTest({
        id: 'TEST-ORPHAN',
        type: 'unit',
        name: 'Legacy test',
        requirements: [] // No requirements linked
      });

      // When: Analyzing orphaned tests
      const orphaned = await coverageCalculator.findOrphanedTests();

      // Then: Should identify the orphaned test
      expect(orphaned).to.have.lengthOf(1);
      expect(orphaned[0].id).to.equal('TEST-ORPHAN');
      expect(orphaned[0].reason).to.include('No requirement links');
    });
  });

  /**
   * STORY 4: Generate Coverage Reports
   * As a Stakeholder
   * I want to view requirement coverage reports
   * So that I understand verification status
   */
  describe('Story 4: Generate Coverage Reports', () => {
    let rvtmManager;
    let reportGenerator;

    beforeEach(async () => {
      rvtmManager = new RVTMManager(TEST_PROJECT_ROOT);
      reportGenerator = new ReportGenerator(rvtmManager);
      await rvtmManager.initialize();

      // Setup test data
      await setupCompleteTestData(rvtmManager);
    });

    it('should show requirement → story → test mappings in report', async () => {
      // When: Generating coverage report
      const report = await reportGenerator.generateReport();

      // Then: Report should contain complete traceability
      expect(report).to.include('Requirement → Story → Test Mappings');
      expect(report).to.include('REQ-001');
      expect(report).to.include('→ STORY-001');
      expect(report).to.include('→ TEST-001');

      // Should show the traceability chain
      expect(report).to.match(/REQ-001.*STORY-001.*TEST-001/s);
    });

    it('should calculate and display coverage percentages', async () => {
      // When: Generating report with coverage metrics
      const report = await reportGenerator.generateReport({ includeCoverage: true });

      // Then: Should display coverage percentages
      expect(report).to.match(/Total Requirements:\s*\d+/);
      expect(report).to.match(/Implemented:\s*\d+\s*\(\d+%\)/);
      expect(report).to.match(/Verified:\s*\d+\s*\(\d+%\)/);
      expect(report).to.match(/Coverage:\s*\d+%/);
    });

    it('should highlight gaps and risks in coverage', async () => {
      // Given: Some requirements without tests
      await rvtmManager.addRequirement({
        id: 'REQ-UNCOVERED',
        text: 'Uncovered requirement',
        priority: 'critical'
      });

      // When: Generating report
      const report = await reportGenerator.generateReport({ highlightGaps: true });

      // Then: Should highlight coverage gaps
      expect(report).to.include('Coverage Gaps');
      expect(report).to.include('REQ-UNCOVERED');
      expect(report).to.include('❌ Not Implemented');
      expect(report).to.include('⚠️ Risk: Critical requirement without coverage');
    });

    it('should export reports in Markdown format', async () => {
      // When: Exporting report as Markdown
      const markdownPath = path.join(TEST_RVTM_PATH, 'reports', 'coverage.md');
      await reportGenerator.exportReport('markdown', markdownPath);

      // Then: Markdown file should be created with proper formatting
      expect(await fs.pathExists(markdownPath)).to.be.true;
      const content = await fs.readFile(markdownPath, 'utf-8');
      expect(content).to.match(/^# RVTM Coverage Report/);
      expect(content).to.include('## Summary');
      expect(content).to.include('| Requirement | Story | Tests | Status |');
    });

    it('should export reports in JSON format', async () => {
      // When: Exporting report as JSON
      const jsonPath = path.join(TEST_RVTM_PATH, 'reports', 'coverage.json');
      await reportGenerator.exportReport('json', jsonPath);

      // Then: JSON file should contain structured data
      expect(await fs.pathExists(jsonPath)).to.be.true;
      const data = await fs.readJson(jsonPath);
      expect(data).to.have.property('metadata');
      expect(data).to.have.property('summary');
      expect(data).to.have.property('requirements');
      expect(data).to.have.property('coverage');
      expect(data.metadata.format).to.equal('json');
      expect(data.metadata.version).to.equal('1.0.0');
    });
  });

  /**
   * STORY 5: Update RVTM During Sprint
   * As a Team Member
   * I want the RVTM to update automatically
   * So that traceability is always current
   */
  describe('Story 5: Update RVTM During Sprint', () => {
    let rvtmManager;

    beforeEach(async () => {
      rvtmManager = new RVTMManager(TEST_PROJECT_ROOT);
      await rvtmManager.initialize({ autoUpdate: true });
      await setupCompleteTestData(rvtmManager);
    });

    it('should update RVTM when story status changes', async () => {
      // Given: A story in progress
      const story = await rvtmManager.getStory('STORY-001');
      expect(story.implementation_status).to.equal('planned');

      // When: Story status changes to completed
      await rvtmManager.updateStoryStatus('STORY-001', 'completed');

      // Then: RVTM should reflect the change
      const updatedStory = await rvtmManager.getStory('STORY-001');
      expect(updatedStory.implementation_status).to.equal('completed');

      // And requirement status should update
      const req = await rvtmManager.getRequirement('REQ-001');
      expect(req.status).to.equal('implemented');
    });

    it('should update verification status when test results change', async () => {
      // Given: A test that hasn't run yet
      const test = await rvtmManager.getTest('TEST-001');
      expect(test.status).to.equal('pending');

      // When: Test passes
      await rvtmManager.updateTestResult('TEST-001', {
        status: 'passed',
        last_execution: new Date().toISOString()
      });

      // Then: Verification status should update
      const req = await rvtmManager.getRequirement('REQ-001');
      expect(req.status).to.equal('verified');

      const updatedTest = await rvtmManager.getTest('TEST-001');
      expect(updatedTest.status).to.equal('passed');
    });

    it('should trigger impact analysis when requirements change', async () => {
      // Given: A requirement with linked stories and tests
      const originalReq = await rvtmManager.getRequirement('REQ-001');

      // When: Requirement changes
      const changeResult = await rvtmManager.updateRequirement('REQ-001', {
        text: 'Modified requirement text',
        modified_date: new Date().toISOString()
      });

      // Then: Should identify impacted items
      expect(changeResult.impact).to.exist;
      expect(changeResult.impact.affected_stories).to.include('STORY-001');
      expect(changeResult.impact.affected_tests).to.include('TEST-001');
      expect(changeResult.impact.risk_level).to.equal('high');
      expect(changeResult.impact.recommendation).to.include('Review and update affected items');
    });

    it('should maintain history for audit trail', async () => {
      // Given: Initial state
      const historyPath = path.join(TEST_RVTM_PATH, 'history', 'changes.log');

      // When: Making multiple changes
      await rvtmManager.createStory({
        id: 'STORY-002',
        title: 'New feature',
        requirements: ['REQ-001']
      });
      await rvtmManager.updateStoryStatus('STORY-002', 'in_progress');
      await rvtmManager.updateStoryStatus('STORY-002', 'completed');

      // Then: History should be maintained
      expect(await fs.pathExists(historyPath)).to.be.true;
      const history = await fs.readFile(historyPath, 'utf-8');

      expect(history).to.include('STORY-002 created');
      expect(history).to.include('STORY-002 status: planned → in_progress');
      expect(history).to.include('STORY-002 status: in_progress → completed');

      // Should include timestamps
      expect(history).to.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  /**
   * Integration Tests - Complete User Journeys
   */
  describe('Integration: Complete RVTM Lifecycle', () => {
    let rvtmManager;
    let coverageCalculator;
    let reportGenerator;

    beforeEach(async () => {
      rvtmManager = new RVTMManager(TEST_PROJECT_ROOT);
      coverageCalculator = new CoverageCalculator(rvtmManager);
      reportGenerator = new ReportGenerator(rvtmManager);
    });

    it('should handle complete project lifecycle from requirements to verification', async () => {
      // Phase 1: Project Initialization
      await rvtmManager.initialize();

      // Phase 2: Requirements Definition
      await rvtmManager.addRequirement({
        id: 'REQ-001',
        text: 'User authentication',
        priority: 'critical',
        source_document: 'PRD-001'
      });
      await rvtmManager.addRequirement({
        id: 'REQ-002',
        text: 'Data encryption',
        priority: 'critical',
        source_document: 'PRD-001'
      });

      // Phase 3: Story Creation and Linking
      await rvtmManager.createStory({
        id: 'STORY-001',
        title: 'Implement auth module',
        requirements: ['REQ-001'],
        sprint: 'Sprint 1'
      });
      await rvtmManager.createStory({
        id: 'STORY-002',
        title: 'Add encryption layer',
        requirements: ['REQ-002'],
        sprint: 'Sprint 1'
      });

      // Phase 4: Test Creation and Mapping
      await rvtmManager.addTest({
        id: 'TEST-001',
        type: 'integration',
        requirements: ['REQ-001'],
        stories: ['STORY-001']
      });
      await rvtmManager.addTest({
        id: 'TEST-002',
        type: 'unit',
        requirements: ['REQ-002'],
        stories: ['STORY-002']
      });

      // Phase 5: Development Progress
      await rvtmManager.updateStoryStatus('STORY-001', 'in_progress');
      await rvtmManager.updateStoryStatus('STORY-001', 'completed');

      // Phase 6: Test Execution
      await rvtmManager.updateTestResult('TEST-001', {
        status: 'passed',
        last_execution: new Date().toISOString()
      });

      // Phase 7: Coverage Analysis
      const coverage = await coverageCalculator.calculateCoverage();
      expect(coverage.total_requirements).to.equal(2);
      expect(coverage.tested_requirements).to.equal(1);
      expect(coverage.coverage_percentage).to.equal(50);

      // Phase 8: Report Generation
      const report = await reportGenerator.generateReport();
      expect(report).to.include('REQ-001');
      expect(report).to.include('✅ Verified');
      expect(report).to.include('REQ-002');
      expect(report).to.include('⚠️ Partial');
    });

    it('should enforce traceability requirements throughout lifecycle', async () => {
      // Initialize with strict validation
      await rvtmManager.initialize({
        settings: {
          require_links: true,
          auto_update: true,
          coverage_threshold: 90
        }
      });

      // Should reject story without requirements
      await expect(rvtmManager.createStory({
        id: 'STORY-INVALID',
        title: 'Story without requirements'
      })).to.be.rejected;

      // Should reject test without requirements
      await expect(rvtmManager.addTest({
        id: 'TEST-INVALID',
        type: 'unit',
        name: 'Test without requirements'
      })).to.be.rejected;

      // Should warn when coverage below threshold
      await rvtmManager.addRequirement({ id: 'REQ-001', text: 'Requirement 1' });
      await rvtmManager.addRequirement({ id: 'REQ-002', text: 'Requirement 2' });

      const validation = await coverageCalculator.validateCoverage();
      expect(validation.passed).to.be.false;
      expect(validation.message).to.include('Coverage 0% is below threshold 90%');
    });
  });

  /**
   * Performance and Scalability Tests
   */
  describe('Performance: RVTM at Scale', () => {
    let rvtmManager;

    beforeEach(async () => {
      rvtmManager = new RVTMManager(TEST_PROJECT_ROOT);
      await rvtmManager.initialize();
    });

    it('should handle large number of requirements efficiently', async function() {
      this.timeout(10000); // Extended timeout for performance test

      // Create 100 requirements
      const startTime = Date.now();

      for (let i = 1; i <= 100; i++) {
        await rvtmManager.addRequirement({
          id: `REQ-${String(i).padStart(3, '0')}`,
          text: `Requirement ${i}`,
          priority: i % 4 === 0 ? 'critical' : 'medium'
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (< 5 seconds)
      expect(duration).to.be.below(5000);

      // Should maintain data integrity
      const requirements = await rvtmManager.getRequirements();
      expect(requirements).to.have.lengthOf(100);
    });

    it('should generate reports quickly for large projects', async function() {
      this.timeout(10000);

      // Setup large dataset
      for (let i = 1; i <= 50; i++) {
        await rvtmManager.addRequirement({
          id: `REQ-${String(i).padStart(3, '0')}`,
          text: `Requirement ${i}`
        });

        await rvtmManager.createStory({
          id: `STORY-${String(i).padStart(3, '0')}`,
          requirements: [`REQ-${String(i).padStart(3, '0')}`]
        });

        await rvtmManager.addTest({
          id: `TEST-${String(i).padStart(3, '0')}`,
          requirements: [`REQ-${String(i).padStart(3, '0')}`]
        });
      }

      // Generate report
      const reportGenerator = new ReportGenerator(rvtmManager);
      const startTime = Date.now();
      const report = await reportGenerator.generateReport();
      const duration = Date.now() - startTime;

      // Should complete within 5 seconds
      expect(duration).to.be.below(5000);
      expect(report).to.exist;
    });
  });
});

/**
 * Helper function to setup complete test data
 */
async function setupCompleteTestData(rvtmManager) {
  // Add requirements
  await rvtmManager.addRequirement({
    id: 'REQ-001',
    text: 'User authentication',
    priority: 'critical',
    source_document: 'PRD-001'
  });

  await rvtmManager.addRequirement({
    id: 'REQ-002',
    text: 'Data persistence',
    priority: 'high',
    source_document: 'PRD-001'
  });

  // Add stories
  await rvtmManager.createStory({
    id: 'STORY-001',
    title: 'Implement login',
    requirements: ['REQ-001'],
    implementation_status: 'planned',
    sprint: 'Sprint 1'
  });

  // Add tests
  await rvtmManager.addTest({
    id: 'TEST-001',
    type: 'integration',
    name: 'Login flow test',
    requirements: ['REQ-001'],
    stories: ['STORY-001'],
    status: 'pending'
  });
}

module.exports = {
  setupCompleteTestData
};