/**
 * RVTM Manager - Core Requirements Verification Traceability Matrix Management
 *
 * This module handles all RVTM operations including:
 * - Initialization and configuration
 * - Requirements management
 * - Story and test linking
 * - Matrix updates and queries
 * - History tracking for audit trails
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class RVTMManager extends EventEmitter {
  constructor(projectRoot) {
    super();
    this.projectRoot = projectRoot;
    this.rvtmPath = path.join(projectRoot, '.rvtm');
    this.configPath = path.join(this.rvtmPath, 'config.yaml');
    this.matrixPath = path.join(this.rvtmPath, 'matrix.json');
    this.historyPath = path.join(this.rvtmPath, 'history', 'changes.log');
    this.config = null;
    this.matrix = null;
  }

  /**
   * Initialize RVTM structure for project
   */
  async initialize(options = {}) {
    try {
      // Create directory structure
      await this.createDirectoryStructure();

      // Initialize configuration
      await this.initializeConfiguration(options);

      // Initialize matrix
      await this.initializeMatrix();

      // Import existing requirements if requested
      if (options.importExisting) {
        await this.importExistingRequirements();
      }

      // Generate baseline report
      await this.generateBaselineReport();

      // Log initialization
      await this.logChange('RVTM initialized', {
        timestamp: new Date().toISOString(),
        options
      });

      this.emit('initialized', { projectRoot: this.projectRoot });
      return { success: true };
    } catch (error) {
      this.emit('error', { operation: 'initialize', error });
      throw error;
    }
  }

  /**
   * Create RVTM directory structure
   */
  async createDirectoryStructure() {
    const directories = [
      this.rvtmPath,
      path.join(this.rvtmPath, 'requirements'),
      path.join(this.rvtmPath, 'requirements', 'index'),
      path.join(this.rvtmPath, 'stories'),
      path.join(this.rvtmPath, 'stories', 'index'),
      path.join(this.rvtmPath, 'tests'),
      path.join(this.rvtmPath, 'tests', 'index'),
      path.join(this.rvtmPath, 'reports'),
      path.join(this.rvtmPath, 'reports', 'latest'),
      path.join(this.rvtmPath, 'reports', 'archive'),
      path.join(this.rvtmPath, 'history')
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
    }
  }

  /**
   * Initialize RVTM configuration
   */
  async initializeConfiguration(options = {}) {
    const defaultConfig = {
      version: '1.0.0',
      project_id: options.project_id || `PROJECT-${Date.now()}`,
      created: new Date().toISOString(),
      settings: {
        require_links: options.require_links !== false,
        auto_update: options.auto_update !== false,
        coverage_threshold: options.coverage_threshold || 90,
        validation_enabled: options.validation_enabled !== false
      },
      requirement_sources: options.requirement_sources || [
        { type: 'prd', path: 'docs/prd/*.md' },
        { type: 'epic', path: 'docs/epics/*.md' }
      ],
      test_sources: options.test_sources || [
        { type: 'unit', path: 'tests/unit/**/*.test.js' },
        { type: 'integration', path: 'tests/integration/**/*.test.js' },
        { type: 'e2e', path: 'tests/e2e/**/*.test.js' }
      ]
    };

    this.config = { ...defaultConfig, ...options };
    await fs.writeFile(this.configPath, yaml.dump(this.config));
  }

  /**
   * Initialize traceability matrix
   */
  async initializeMatrix() {
    this.matrix = {
      version: '1.0.0',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      requirements: {},
      stories: {},
      tests: {},
      links: []
    };

    await this.saveMatrix();
  }

  /**
   * Get current configuration
   */
  async getConfiguration() {
    if (!this.config) {
      if (await fs.pathExists(this.configPath)) {
        const configYaml = await fs.readFile(this.configPath, 'utf-8');
        this.config = yaml.load(configYaml);
      }
    }
    return this.config;
  }

  /**
   * Update configuration
   */
  async updateConfiguration(updates) {
    this.config = { ...this.config, ...updates };
    await fs.writeFile(this.configPath, yaml.dump(this.config));
    await this.logChange('Configuration updated', updates);
    return this.config;
  }

  /**
   * Add a requirement to RVTM
   */
  async addRequirement(requirement) {
    await this.loadMatrix();

    const reqId = requirement.id;
    const reqData = {
      ...requirement,
      created_date: requirement.created_date || new Date().toISOString(),
      modified_date: new Date().toISOString(),
      status: requirement.status || 'draft',
      tags: requirement.tags || []
    };

    this.matrix.requirements[reqId] = reqData;

    // Save requirement details
    const reqDir = path.join(this.rvtmPath, 'requirements', reqId);
    await fs.ensureDir(reqDir);
    await fs.writeJson(path.join(reqDir, 'requirement.json'), reqData);

    await this.saveMatrix();
    await this.logChange(`Requirement ${reqId} added`, reqData);

    this.emit('requirement:added', reqData);
    return reqData;
  }

  /**
   * Get a specific requirement
   */
  async getRequirement(reqId) {
    await this.loadMatrix();
    return this.matrix.requirements[reqId];
  }

  /**
   * Get all requirements
   */
  async getRequirements() {
    await this.loadMatrix();
    return Object.values(this.matrix.requirements);
  }

  /**
   * Update a requirement
   */
  async updateRequirement(reqId, updates) {
    await this.loadMatrix();

    if (!this.matrix.requirements[reqId]) {
      throw new Error(`Requirement ${reqId} not found`);
    }

    const oldReq = { ...this.matrix.requirements[reqId] };
    this.matrix.requirements[reqId] = {
      ...oldReq,
      ...updates,
      modified_date: new Date().toISOString()
    };

    await this.saveMatrix();

    // Perform impact analysis
    const impact = await this.analyzeRequirementChangeImpact(reqId, oldReq, updates);

    await this.logChange(`Requirement ${reqId} updated`, { updates, impact });

    this.emit('requirement:updated', { reqId, updates, impact });
    return { success: true, impact };
  }

  /**
   * Create a story with requirement links
   */
  async createStory(storyData) {
    await this.loadMatrix();
    const config = await this.getConfiguration();

    // Validate requirement links if required
    if (config.settings.require_links) {
      if (!storyData.requirements || storyData.requirements.length === 0) {
        const error = 'Stories must be linked to at least one requirement';
        return { success: false, error };
      }
    }

    const storyId = storyData.id;
    const story = {
      ...storyData,
      implementation_status: storyData.implementation_status || 'planned',
      created_date: new Date().toISOString()
    };

    this.matrix.stories[storyId] = story;

    // Create trace links
    if (storyData.requirements) {
      for (const reqId of storyData.requirements) {
        await this.createTraceLink('story', storyId, 'requirement', reqId, 'implements');
      }
    }

    // Save story details
    const storyDir = path.join(this.rvtmPath, 'stories', storyId);
    await fs.ensureDir(storyDir);
    await fs.writeJson(path.join(storyDir, 'story.json'), story);

    await this.saveMatrix();
    await this.logChange(`Story ${storyId} created`, story);

    this.emit('story:created', story);
    return { success: true, story };
  }

  /**
   * Get a specific story
   */
  async getStory(storyId) {
    await this.loadMatrix();
    return this.matrix.stories[storyId];
  }

  /**
   * Update story status
   */
  async updateStoryStatus(storyId, status) {
    await this.loadMatrix();

    if (!this.matrix.stories[storyId]) {
      throw new Error(`Story ${storyId} not found`);
    }

    const oldStatus = this.matrix.stories[storyId].implementation_status;
    this.matrix.stories[storyId].implementation_status = status;

    // Update requirement status if story is completed
    if (status === 'completed') {
      const storyReqs = this.matrix.stories[storyId].requirements || [];
      for (const reqId of storyReqs) {
        if (this.matrix.requirements[reqId]) {
          this.matrix.requirements[reqId].status = 'implemented';
        }
      }
    }

    await this.saveMatrix();
    await this.logChange(`Story ${storyId} status: ${oldStatus} → ${status}`);

    this.emit('story:status:changed', { storyId, oldStatus, newStatus: status });
    return { success: true };
  }

  /**
   * Add a test with requirement mappings
   */
  async addTest(testData) {
    await this.loadMatrix();
    const config = await this.getConfiguration();

    // Validate requirement links if required
    if (config.settings.require_links) {
      if (!testData.requirements || testData.requirements.length === 0) {
        throw new Error('Tests must be linked to at least one requirement');
      }
    }

    const testId = testData.id;
    const test = {
      ...testData,
      status: testData.status || 'pending',
      created_date: new Date().toISOString(),
      coverage_percentage: 0
    };

    this.matrix.tests[testId] = test;

    // Create trace links
    if (testData.requirements) {
      for (const reqId of testData.requirements) {
        await this.createTraceLink('test', testId, 'requirement', reqId, 'verifies');
      }
    }

    // Save test details
    const testDir = path.join(this.rvtmPath, 'tests', testId);
    await fs.ensureDir(testDir);
    await fs.writeJson(path.join(testDir, 'test.json'), test);

    await this.saveMatrix();
    await this.logChange(`Test ${testId} added`, test);

    this.emit('test:added', test);
    return test;
  }

  /**
   * Get a specific test
   */
  async getTest(testId) {
    await this.loadMatrix();
    return this.matrix.tests[testId];
  }

  /**
   * Get all tests
   */
  async getTests() {
    await this.loadMatrix();
    return Object.values(this.matrix.tests);
  }

  /**
   * Update test result
   */
  async updateTestResult(testId, result) {
    await this.loadMatrix();

    if (!this.matrix.tests[testId]) {
      throw new Error(`Test ${testId} not found`);
    }

    this.matrix.tests[testId] = {
      ...this.matrix.tests[testId],
      ...result
    };

    // Update requirement verification status if test passed
    if (result.status === 'passed') {
      const testReqs = this.matrix.tests[testId].requirements || [];
      for (const reqId of testReqs) {
        if (this.matrix.requirements[reqId]) {
          // Check if all tests for this requirement passed
          const allTestsPassed = await this.checkAllTestsPassed(reqId);
          if (allTestsPassed) {
            this.matrix.requirements[reqId].status = 'verified';
          }
        }
      }
    }

    await this.saveMatrix();
    await this.logChange(`Test ${testId} result updated`, result);

    this.emit('test:result:updated', { testId, result });
    return { success: true };
  }

  /**
   * Create a trace link between items
   */
  async createTraceLink(fromType, fromId, toType, toId, linkType) {
    const link = {
      id: uuidv4(),
      from_type: fromType,
      from_id: fromId,
      to_type: toType,
      to_id: toId,
      link_type: linkType,
      created_date: new Date().toISOString()
    };

    this.matrix.links.push(link);
    return link;
  }

  /**
   * Get the complete traceability matrix
   */
  async getMatrix() {
    await this.loadMatrix();
    return this.matrix;
  }

  /**
   * Import existing requirements from PRDs
   */
  async importExistingRequirements() {
    const config = await this.getConfiguration();
    const glob = require('glob');

    for (const source of config.requirement_sources) {
      const pattern = path.join(this.projectRoot, source.path);
      const files = glob.sync(pattern);

      for (const file of files) {
        await this.importRequirementsFromFile(file, source.type);
      }
    }
  }

  /**
   * Import requirements from a single file
   */
  async importRequirementsFromFile(filePath, sourceType) {
    const content = await fs.readFile(filePath, 'utf-8');
    const requirements = this.extractRequirements(content);

    for (const req of requirements) {
      await this.addRequirement({
        ...req,
        source_document: path.basename(filePath),
        source_type: sourceType
      });
    }
  }

  /**
   * Extract requirements from markdown content
   */
  extractRequirements(content) {
    const requirements = [];
    const reqPattern = /(?:^|\n)-?\s*(REQ-\d+):?\s*(.+?)(?=\n|$)/gm;
    let match;

    while ((match = reqPattern.exec(content)) !== null) {
      requirements.push({
        id: match[1],
        text: match[2].trim()
      });
    }

    return requirements;
  }

  /**
   * Generate baseline report
   */
  async generateBaselineReport() {
    const reportContent = `# RVTM Baseline Report

Generated: ${new Date().toISOString()}

## Summary
- Total Requirements: ${Object.keys(this.matrix.requirements).length}
- Total Stories: ${Object.keys(this.matrix.stories).length}
- Total Tests: ${Object.keys(this.matrix.tests).length}
- Total Links: ${this.matrix.links.length}

## Status
Project initialized and ready for traceability tracking.
`;

    const reportPath = path.join(this.rvtmPath, 'reports', 'latest', 'baseline.md');
    await fs.writeFile(reportPath, reportContent);
  }

  /**
   * Analyze impact of requirement changes
   */
  async analyzeRequirementChangeImpact(reqId, oldReq, updates) {
    const affectedStories = [];
    const affectedTests = [];

    // Find all linked stories
    for (const link of this.matrix.links) {
      if (link.to_id === reqId && link.from_type === 'story') {
        affectedStories.push(link.from_id);
      }
      if (link.to_id === reqId && link.from_type === 'test') {
        affectedTests.push(link.from_id);
      }
    }

    const riskLevel = oldReq.priority === 'critical' || affectedStories.length > 3
      ? 'high'
      : affectedStories.length > 0
        ? 'medium'
        : 'low';

    return {
      affected_stories: affectedStories,
      affected_tests: affectedTests,
      risk_level: riskLevel,
      recommendation: `Review and update affected items: ${affectedStories.length} stories, ${affectedTests.length} tests`
    };
  }

  /**
   * Check if all tests for a requirement passed
   */
  async checkAllTestsPassed(reqId) {
    const linkedTests = this.matrix.links
      .filter(l => l.to_id === reqId && l.from_type === 'test')
      .map(l => l.from_id);

    for (const testId of linkedTests) {
      const test = this.matrix.tests[testId];
      if (test && test.status !== 'passed') {
        return false;
      }
    }

    return linkedTests.length > 0;
  }

  /**
   * Load matrix from file
   */
  async loadMatrix() {
    if (!this.matrix && await fs.pathExists(this.matrixPath)) {
      this.matrix = await fs.readJson(this.matrixPath);
    } else if (!this.matrix) {
      await this.initializeMatrix();
    }
  }

  /**
   * Save matrix to file
   */
  async saveMatrix() {
    this.matrix.lastModified = new Date().toISOString();
    await fs.writeJson(this.matrixPath, this.matrix, { spaces: 2 });
  }

  /**
   * Log changes for audit trail
   */
  async logChange(message, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n${JSON.stringify(details, null, 2)}\n---\n`;

    await fs.ensureDir(path.dirname(this.historyPath));
    await fs.appendFile(this.historyPath, logEntry);
  }
}

module.exports = RVTMManager;