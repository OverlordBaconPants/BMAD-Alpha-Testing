/**
 * Report Generator - Generate RVTM coverage and traceability reports
 *
 * This module handles:
 * - Markdown report generation
 * - JSON report exports
 * - Traceability matrix visualization
 * - Coverage dashboards
 * - Executive summaries
 */

const fs = require('fs-extra');
const path = require('path');
const CoverageCalculator = require('./coverage-calculator');

class ReportGenerator {
  constructor(rvtmManager) {
    this.rvtmManager = rvtmManager;
    this.coverageCalculator = new CoverageCalculator(rvtmManager);
  }

  /**
   * Generate comprehensive RVTM report
   */
  async generateReport(options = {}) {
    const matrix = await this.rvtmManager.getMatrix();
    const coverage = await this.coverageCalculator.calculateCoverage();
    const timestamp = new Date().toISOString();

    let report = this.generateHeader(timestamp);

    // Executive Summary
    report += this.generateExecutiveSummary(coverage, matrix);

    // Coverage Metrics
    if (options.includeCoverage !== false) {
      report += this.generateCoverageSection(coverage);
    }

    // Traceability Matrix
    report += this.generateTraceabilityMatrix(matrix, coverage);

    // Coverage Gaps
    if (options.highlightGaps !== false) {
      report += this.generateGapsSection(coverage);
    }

    // Risk Assessment
    if (coverage.risks && coverage.risks.length > 0) {
      report += this.generateRisksSection(coverage.risks);
    }

    // Detailed Requirements Status
    report += this.generateRequirementsSection(matrix, coverage);

    // Test Summary
    report += this.generateTestSummary(matrix, coverage);

    // Recommendations
    const summary = await this.coverageCalculator.generateCoverageSummary();
    report += this.generateRecommendations(summary);

    // Footer
    report += this.generateFooter(timestamp);

    return report;
  }

  /**
   * Generate report header
   */
  generateHeader(timestamp) {
    return `# RVTM Coverage Report

Generated: ${timestamp}

---

`;
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(coverage, matrix) {
    const statusEmoji = this.getStatusEmoji(coverage.coverage_percentage);

    return `## Executive Summary

**Overall Coverage Status:** ${statusEmoji} ${this.coverageCalculator.determineCoverageStatus(coverage).toUpperCase()}

| Metric | Value | Status |
|--------|-------|--------|
| Total Requirements | ${coverage.total_requirements} | - |
| Implemented | ${coverage.implemented_requirements} (${coverage.implementation_percentage}%) | ${this.getStatusEmoji(coverage.implementation_percentage)} |
| Verified | ${coverage.verified_requirements} (${coverage.verification_percentage}%) | ${this.getStatusEmoji(coverage.verification_percentage)} |
| Test Coverage | ${coverage.tested_requirements} (${coverage.coverage_percentage}%) | ${this.getStatusEmoji(coverage.coverage_percentage)} |

`;
  }

  /**
   * Generate coverage section
   */
  generateCoverageSection(coverage) {
    let section = `## Coverage Metrics

### Overall Coverage
- **Total Requirements:** ${coverage.total_requirements}
- **Implemented:** ${coverage.implemented_requirements} (${coverage.implementation_percentage}%)
- **Tested:** ${coverage.tested_requirements} (${coverage.coverage_percentage}%)
- **Verified:** ${coverage.verified_requirements} (${coverage.verification_percentage}%)

### Coverage Distribution

`;

    // Coverage by priority
    const byPriority = this.groupRequirementsByPriority(coverage.requirements);
    section += '| Priority | Total | Covered | Percentage |\n';
    section += '|----------|-------|---------|------------|\n';

    for (const [priority, reqs] of Object.entries(byPriority)) {
      const covered = reqs.filter(r => r.covered).length;
      const percentage = reqs.length > 0 ? Math.round((covered / reqs.length) * 100) : 0;
      section += `| ${priority} | ${reqs.length} | ${covered} | ${percentage}% |\n`;
    }

    section += '\n';
    return section;
  }

  /**
   * Generate traceability matrix section
   */
  generateTraceabilityMatrix(matrix, coverage) {
    let section = `## Requirement → Story → Test Mappings

`;

    const requirements = Object.values(matrix.requirements);

    if (requirements.length === 0) {
      return section + '_No requirements defined yet._\n\n';
    }

    // Group by requirement
    for (const req of requirements) {
      const reqCoverage = coverage.requirements[req.id];
      const statusIcon = this.getRequirementStatusIcon(reqCoverage);

      section += `### ${req.id}: ${req.text}\n`;
      section += `**Priority:** ${req.priority} | **Status:** ${statusIcon} ${reqCoverage.coverage_status}\n\n`;

      // List linked stories
      if (reqCoverage.linked_stories.length > 0) {
        section += '**Stories:**\n';
        for (const storyId of reqCoverage.linked_stories) {
          const story = matrix.stories[storyId];
          if (story) {
            section += `- → ${storyId}: ${story.title} (${story.implementation_status})\n`;
          }
        }
        section += '\n';
      }

      // List linked tests
      if (reqCoverage.linked_tests.length > 0) {
        section += '**Tests:**\n';
        for (const testId of reqCoverage.linked_tests) {
          const test = matrix.tests[testId];
          if (test) {
            const testStatus = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏸';
            section += `- → ${testId}: ${test.name || testId} [${test.type}] ${testStatus}\n`;
          }
        }
        section += '\n';
      }

      if (reqCoverage.linked_stories.length === 0 && reqCoverage.linked_tests.length === 0) {
        section += '_No implementation or tests linked._\n\n';
      }
    }

    return section;
  }

  /**
   * Generate gaps section
   */
  generateGapsSection(coverage) {
    let section = `## Coverage Gaps

`;

    if (coverage.gaps.length === 0) {
      return section + '✅ **No coverage gaps identified!**\n\n';
    }

    section += `Found ${coverage.gaps.length} requirement(s) without adequate coverage:\n\n`;

    // Group gaps by priority
    const gapsByPriority = {};
    for (const gap of coverage.gaps) {
      if (!gapsByPriority[gap.priority]) {
        gapsByPriority[gap.priority] = [];
      }
      gapsByPriority[gap.priority].push(gap);
    }

    // Display critical gaps first
    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    for (const priority of priorityOrder) {
      if (gapsByPriority[priority] && gapsByPriority[priority].length > 0) {
        section += `### ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Gaps\n\n`;
        for (const gap of gapsByPriority[priority]) {
          section += `- **${gap.requirement_id}:** ${gap.text}\n`;
          section += `  - ❌ Not Implemented\n`;
          if (priority === 'critical') {
            section += `  - ⚠️ **Risk: Critical requirement without coverage**\n`;
          }
        }
        section += '\n';
      }
    }

    return section;
  }

  /**
   * Generate risks section
   */
  generateRisksSection(risks) {
    let section = `## Risk Assessment

`;

    const highRisks = risks.filter(r => r.severity === 'high');
    const mediumRisks = risks.filter(r => r.severity === 'medium');
    const lowRisks = risks.filter(r => r.severity === 'low');

    if (highRisks.length > 0) {
      section += `### 🔴 High Severity Risks (${highRisks.length})\n\n`;
      for (const risk of highRisks) {
        section += `- **${risk.type}:** ${risk.description}\n`;
        section += `  - **Mitigation:** ${risk.mitigation}\n\n`;
      }
    }

    if (mediumRisks.length > 0) {
      section += `### 🟡 Medium Severity Risks (${mediumRisks.length})\n\n`;
      for (const risk of mediumRisks) {
        section += `- **${risk.type}:** ${risk.description}\n`;
        section += `  - **Mitigation:** ${risk.mitigation}\n\n`;
      }
    }

    if (lowRisks.length > 0) {
      section += `### 🟢 Low Severity Risks (${lowRisks.length})\n\n`;
      for (const risk of lowRisks) {
        section += `- ${risk.description}\n`;
      }
      section += '\n';
    }

    return section;
  }

  /**
   * Generate requirements status table
   */
  generateRequirementsSection(matrix, coverage) {
    let section = `## Critical Requirements Status

| Requirement | Story | Tests | Status |
|------------|-------|-------|--------|
`;

    const requirements = Object.values(matrix.requirements)
      .filter(r => r.priority === 'critical' || r.priority === 'high')
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    for (const req of requirements) {
      const reqCoverage = coverage.requirements[req.id];
      const storiesText = reqCoverage.linked_stories.join(', ') || '-';
      const testsText = reqCoverage.linked_tests.join(', ') || '-';
      const statusIcon = this.getRequirementStatusIcon(reqCoverage);

      section += `| ${req.id} | ${storiesText} | ${testsText} | ${statusIcon} ${this.getStatusText(reqCoverage)} |\n`;
    }

    section += '\n';
    return section;
  }

  /**
   * Generate test summary
   */
  generateTestSummary(matrix, coverage) {
    const tests = Object.values(matrix.tests);

    let section = `## Test Summary

**Total Tests:** ${tests.length}

### Test Status Distribution
`;

    const statusCounts = {
      passed: tests.filter(t => t.status === 'passed').length,
      failed: tests.filter(t => t.status === 'failed').length,
      pending: tests.filter(t => t.status === 'pending').length,
      skipped: tests.filter(t => t.status === 'skipped').length
    };

    section += '| Status | Count | Percentage |\n';
    section += '|--------|-------|------------|\n';

    for (const [status, count] of Object.entries(statusCounts)) {
      const percentage = tests.length > 0 ? Math.round((count / tests.length) * 100) : 0;
      const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : status === 'pending' ? '⏸' : '⏭';
      section += `| ${icon} ${status} | ${count} | ${percentage}% |\n`;
    }

    section += '\n### Test Type Distribution\n\n';

    const typeCounts = {
      unit: tests.filter(t => t.type === 'unit').length,
      integration: tests.filter(t => t.type === 'integration').length,
      e2e: tests.filter(t => t.type === 'e2e').length,
      user_journey: tests.filter(t => t.type === 'user_journey').length
    };

    section += '| Type | Count |\n';
    section += '|------|-------|\n';

    for (const [type, count] of Object.entries(typeCounts)) {
      section += `| ${type.replace('_', ' ')} | ${count} |\n`;
    }

    section += '\n';
    return section;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(summary) {
    let section = `## Recommendations

`;

    if (summary.recommendation) {
      const recommendations = summary.recommendation.split('; ');
      for (const rec of recommendations) {
        section += `- ${rec}\n`;
      }
    }

    section += '\n';
    return section;
  }

  /**
   * Generate footer
   */
  generateFooter(timestamp) {
    return `---

_Report generated on ${timestamp} by RVTM System_
`;
  }

  /**
   * Export report in specified format
   */
  async exportReport(format, outputPath) {
    const matrix = await this.rvtmManager.getMatrix();
    const coverage = await this.coverageCalculator.calculateCoverage();

    if (format === 'markdown') {
      const report = await this.generateReport();
      await fs.writeFile(outputPath, report);
    } else if (format === 'json') {
      const jsonReport = await this.generateJsonReport(matrix, coverage);
      await fs.writeJson(outputPath, jsonReport, { spaces: 2 });
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate JSON format report
   */
  async generateJsonReport(matrix, coverage) {
    const summary = await this.coverageCalculator.generateCoverageSummary();

    return {
      metadata: {
        format: 'json',
        version: '1.0.0',
        generated: new Date().toISOString(),
        project_id: matrix.project_id
      },
      summary: {
        total_requirements: coverage.total_requirements,
        implemented_requirements: coverage.implemented_requirements,
        tested_requirements: coverage.tested_requirements,
        verified_requirements: coverage.verified_requirements,
        coverage_percentage: coverage.coverage_percentage,
        implementation_percentage: coverage.implementation_percentage,
        verification_percentage: coverage.verification_percentage,
        status: summary.status
      },
      requirements: Object.entries(coverage.requirements).map(([id, data]) => ({
        id,
        ...data,
        details: matrix.requirements[id]
      })),
      stories: Object.entries(matrix.stories).map(([id, story]) => ({
        id,
        ...story,
        coverage: coverage.stories[id]
      })),
      tests: Object.entries(matrix.tests).map(([id, test]) => ({
        id,
        ...test,
        coverage: coverage.tests[id]
      })),
      coverage: {
        gaps: coverage.gaps,
        risks: coverage.risks,
        orphaned_tests: await this.coverageCalculator.findOrphanedTests(),
        uncovered_requirements: await this.coverageCalculator.findUncoveredRequirements()
      },
      recommendations: summary.recommendation.split('; ')
    };
  }

  /**
   * Helper: Get status emoji based on percentage
   */
  getStatusEmoji(percentage) {
    if (percentage >= 90) return '✅';
    if (percentage >= 70) return '🟢';
    if (percentage >= 50) return '🟡';
    if (percentage >= 30) return '🟠';
    return '🔴';
  }

  /**
   * Helper: Get requirement status icon
   */
  getRequirementStatusIcon(reqCoverage) {
    if (reqCoverage.all_tests_passed) return '✅';
    if (reqCoverage.has_tests) return '🟡';
    if (reqCoverage.has_stories) return '⚠️';
    return '❌';
  }

  /**
   * Helper: Get status text
   */
  getStatusText(reqCoverage) {
    if (reqCoverage.all_tests_passed) return 'Verified';
    if (reqCoverage.has_tests && reqCoverage.has_stories) return 'Partial';
    if (reqCoverage.has_stories) return 'Implemented';
    return 'Not Implemented';
  }

  /**
   * Helper: Group requirements by priority
   */
  groupRequirementsByPriority(requirements) {
    const grouped = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    for (const req of Object.values(requirements)) {
      const priority = req.priority || 'medium';
      if (grouped[priority]) {
        grouped[priority].push(req);
      }
    }

    return grouped;
  }
}

module.exports = ReportGenerator;