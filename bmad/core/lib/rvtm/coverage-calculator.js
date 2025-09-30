/**
 * Coverage Calculator - Calculate RVTM test coverage metrics
 *
 * This module handles:
 * - Coverage percentage calculations
 * - Gap analysis
 * - Orphaned test identification
 * - Coverage validation against thresholds
 * - Risk assessment based on coverage
 */

class CoverageCalculator {
  constructor(rvtmManager) {
    this.rvtmManager = rvtmManager;
  }

  /**
   * Calculate overall coverage metrics
   */
  async calculateCoverage() {
    const matrix = await this.rvtmManager.getMatrix();
    const requirements = Object.values(matrix.requirements);
    const tests = Object.values(matrix.tests);
    const stories = Object.values(matrix.stories);

    // Initialize coverage data
    const coverage = {
      total_requirements: requirements.length,
      tested_requirements: 0,
      implemented_requirements: 0,
      verified_requirements: 0,
      coverage_percentage: 0,
      implementation_percentage: 0,
      verification_percentage: 0,
      requirements: {},
      stories: {},
      tests: {},
      gaps: [],
      risks: []
    };

    // Calculate requirement-level coverage
    for (const req of requirements) {
      const reqCoverage = await this.calculateRequirementCoverage(req.id, matrix);
      coverage.requirements[req.id] = reqCoverage;

      if (reqCoverage.has_stories) {
        coverage.implemented_requirements++;
      }
      if (reqCoverage.has_tests) {
        coverage.tested_requirements++;
      }
      if (reqCoverage.all_tests_passed) {
        coverage.verified_requirements++;
      }
      if (!reqCoverage.covered) {
        coverage.gaps.push({
          requirement_id: req.id,
          type: 'no_coverage',
          priority: req.priority,
          text: req.text
        });
      }
    }

    // Calculate story coverage
    for (const story of stories) {
      coverage.stories[story.id] = await this.calculateStoryCoverage(story.id, matrix);
    }

    // Calculate test effectiveness
    for (const test of tests) {
      coverage.tests[test.id] = await this.calculateTestCoverage(test.id, matrix);
    }

    // Calculate percentages
    if (requirements.length > 0) {
      coverage.coverage_percentage = Math.round(
        (coverage.tested_requirements / requirements.length) * 100
      );
      coverage.implementation_percentage = Math.round(
        (coverage.implemented_requirements / requirements.length) * 100
      );
      coverage.verification_percentage = Math.round(
        (coverage.verified_requirements / requirements.length) * 100
      );
    }

    // Identify risks
    coverage.risks = await this.identifyRisks(coverage, matrix);

    return coverage;
  }

  /**
   * Calculate coverage for a specific requirement
   */
  async calculateRequirementCoverage(reqId, matrix) {
    const requirement = matrix.requirements[reqId];
    const linkedStories = [];
    const linkedTests = [];
    const passedTests = [];

    // Find linked stories and tests
    for (const link of matrix.links) {
      if (link.to_id === reqId) {
        if (link.from_type === 'story' && link.link_type === 'implements') {
          linkedStories.push(link.from_id);
        }
        if (link.from_type === 'test' && link.link_type === 'verifies') {
          linkedTests.push(link.from_id);
          const test = matrix.tests[link.from_id];
          if (test && test.status === 'passed') {
            passedTests.push(link.from_id);
          }
        }
      }
    }

    const hasStories = linkedStories.length > 0;
    const hasTests = linkedTests.length > 0;
    const allTestsPassed = hasTests && passedTests.length === linkedTests.length;

    return {
      requirement_id: reqId,
      priority: requirement.priority,
      status: requirement.status,
      linked_stories: linkedStories,
      linked_tests: linkedTests,
      passed_tests: passedTests,
      has_stories: hasStories,
      has_tests: hasTests,
      all_tests_passed: allTestsPassed,
      covered: hasStories && hasTests,
      coverage_status: allTestsPassed ? 'verified' : hasTests ? 'tested' : hasStories ? 'implemented' : 'not_covered',
      test_coverage_percentage: hasTests ? Math.round((passedTests.length / linkedTests.length) * 100) : 0
    };
  }

  /**
   * Calculate coverage for a specific story
   */
  async calculateStoryCoverage(storyId, matrix) {
    const story = matrix.stories[storyId];
    const linkedRequirements = story.requirements || [];
    const linkedTests = [];

    // Find tests for this story
    for (const link of matrix.links) {
      if (link.to_id === storyId && link.from_type === 'test') {
        linkedTests.push(link.from_id);
      }
    }

    // Check test results
    const passedTests = linkedTests.filter(testId => {
      const test = matrix.tests[testId];
      return test && test.status === 'passed';
    });

    return {
      story_id: storyId,
      status: story.implementation_status,
      linked_requirements: linkedRequirements,
      linked_tests: linkedTests,
      passed_tests: passedTests,
      has_tests: linkedTests.length > 0,
      all_tests_passed: linkedTests.length > 0 && passedTests.length === linkedTests.length,
      test_coverage_percentage: linkedTests.length > 0
        ? Math.round((passedTests.length / linkedTests.length) * 100)
        : 0
    };
  }

  /**
   * Calculate test effectiveness
   */
  async calculateTestCoverage(testId, matrix) {
    const test = matrix.tests[testId];
    const linkedRequirements = test.requirements || [];
    const linkedStories = test.stories || [];

    // Calculate requirement coverage by this test
    const criticalRequirements = linkedRequirements.filter(reqId => {
      const req = matrix.requirements[reqId];
      return req && req.priority === 'critical';
    });

    return {
      test_id: testId,
      type: test.type,
      status: test.status,
      linked_requirements: linkedRequirements,
      linked_stories: linkedStories,
      covers_critical: criticalRequirements.length > 0,
      critical_requirements: criticalRequirements,
      effectiveness_score: this.calculateEffectivenessScore(test, linkedRequirements, matrix)
    };
  }

  /**
   * Calculate test effectiveness score
   */
  calculateEffectivenessScore(test, linkedRequirements, matrix) {
    let score = 0;

    // Base score from test status
    if (test.status === 'passed') score += 50;
    else if (test.status === 'failed') score -= 10;

    // Score from requirement priority
    for (const reqId of linkedRequirements) {
      const req = matrix.requirements[reqId];
      if (req) {
        if (req.priority === 'critical') score += 20;
        else if (req.priority === 'high') score += 15;
        else if (req.priority === 'medium') score += 10;
        else score += 5;
      }
    }

    // Score from test type
    if (test.type === 'user_journey') score += 15;
    else if (test.type === 'e2e') score += 10;
    else if (test.type === 'integration') score += 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Find orphaned tests (tests without requirement links)
   */
  async findOrphanedTests() {
    const matrix = await this.rvtmManager.getMatrix();
    const orphaned = [];

    for (const test of Object.values(matrix.tests)) {
      if (!test.requirements || test.requirements.length === 0) {
        orphaned.push({
          id: test.id,
          type: test.type,
          name: test.name || test.id,
          reason: 'No requirement links'
        });
      } else {
        // Check if linked requirements exist
        const validReqs = test.requirements.filter(reqId => matrix.requirements[reqId]);
        if (validReqs.length === 0) {
          orphaned.push({
            id: test.id,
            type: test.type,
            name: test.name || test.id,
            reason: 'Linked requirements do not exist'
          });
        }
      }
    }

    return orphaned;
  }

  /**
   * Find uncovered requirements
   */
  async findUncoveredRequirements() {
    const coverage = await this.calculateCoverage();
    const uncovered = [];

    for (const [reqId, reqCoverage] of Object.entries(coverage.requirements)) {
      if (!reqCoverage.covered) {
        const req = await this.rvtmManager.getRequirement(reqId);
        uncovered.push({
          id: reqId,
          text: req.text,
          priority: req.priority,
          missing: {
            stories: !reqCoverage.has_stories,
            tests: !reqCoverage.has_tests
          }
        });
      }
    }

    return uncovered;
  }

  /**
   * Validate coverage against thresholds
   */
  async validateCoverage() {
    const config = await this.rvtmManager.getConfiguration();
    const threshold = config.settings.coverage_threshold || 90;
    const coverage = await this.calculateCoverage();

    const passed = coverage.coverage_percentage >= threshold;
    const message = passed
      ? `Coverage ${coverage.coverage_percentage}% meets threshold ${threshold}%`
      : `Coverage ${coverage.coverage_percentage}% is below threshold ${threshold}%`;

    return {
      passed,
      threshold,
      actual: coverage.coverage_percentage,
      message,
      details: {
        total_requirements: coverage.total_requirements,
        tested_requirements: coverage.tested_requirements,
        verified_requirements: coverage.verified_requirements,
        gaps: coverage.gaps
      }
    };
  }

  /**
   * Identify risks based on coverage analysis
   */
  async identifyRisks(coverage, matrix) {
    const risks = [];

    // Critical requirements without coverage
    for (const [reqId, reqCoverage] of Object.entries(coverage.requirements)) {
      const req = matrix.requirements[reqId];
      if (req && req.priority === 'critical' && !reqCoverage.covered) {
        risks.push({
          type: 'critical_uncovered',
          severity: 'high',
          requirement_id: reqId,
          description: `Critical requirement "${req.text}" has no test coverage`,
          mitigation: 'Add tests for this requirement immediately'
        });
      }
    }

    // Stories without tests
    for (const [storyId, storyCoverage] of Object.entries(coverage.stories)) {
      if (!storyCoverage.has_tests) {
        const story = matrix.stories[storyId];
        const linkedReqs = story.requirements || [];
        const hasCriticalReq = linkedReqs.some(reqId => {
          const req = matrix.requirements[reqId];
          return req && req.priority === 'critical';
        });

        if (hasCriticalReq) {
          risks.push({
            type: 'story_without_tests',
            severity: 'high',
            story_id: storyId,
            description: `Story "${story.title}" implements critical requirements but has no tests`,
            mitigation: 'Add tests for this story'
          });
        }
      }
    }

    // Low overall coverage
    if (coverage.coverage_percentage < 50) {
      risks.push({
        type: 'low_coverage',
        severity: 'high',
        description: `Overall test coverage is critically low at ${coverage.coverage_percentage}%`,
        mitigation: 'Prioritize test creation for uncovered requirements'
      });
    } else if (coverage.coverage_percentage < 70) {
      risks.push({
        type: 'low_coverage',
        severity: 'medium',
        description: `Overall test coverage is below recommended levels at ${coverage.coverage_percentage}%`,
        mitigation: 'Increase test coverage to at least 70%'
      });
    }

    // Failed tests for critical requirements
    for (const [testId, testCoverage] of Object.entries(coverage.tests)) {
      const test = matrix.tests[testId];
      if (test.status === 'failed' && testCoverage.covers_critical) {
        risks.push({
          type: 'failed_critical_test',
          severity: 'high',
          test_id: testId,
          description: `Test "${testId}" for critical requirements is failing`,
          mitigation: 'Fix failing test immediately'
        });
      }
    }

    return risks;
  }

  /**
   * Generate coverage summary
   */
  async generateCoverageSummary() {
    const coverage = await this.calculateCoverage();
    const orphanedTests = await this.findOrphanedTests();
    const uncoveredReqs = await this.findUncoveredRequirements();

    return {
      timestamp: new Date().toISOString(),
      metrics: {
        total_requirements: coverage.total_requirements,
        tested_requirements: coverage.tested_requirements,
        verified_requirements: coverage.verified_requirements,
        coverage_percentage: coverage.coverage_percentage,
        implementation_percentage: coverage.implementation_percentage,
        verification_percentage: coverage.verification_percentage
      },
      health: {
        orphaned_tests: orphanedTests.length,
        uncovered_requirements: uncoveredReqs.length,
        critical_gaps: coverage.gaps.filter(g => g.priority === 'critical').length,
        high_risks: coverage.risks.filter(r => r.severity === 'high').length
      },
      status: this.determineCoverageStatus(coverage),
      recommendation: this.generateRecommendation(coverage, orphanedTests, uncoveredReqs)
    };
  }

  /**
   * Determine overall coverage status
   */
  determineCoverageStatus(coverage) {
    if (coverage.verification_percentage >= 90) {
      return 'excellent';
    } else if (coverage.coverage_percentage >= 80) {
      return 'good';
    } else if (coverage.coverage_percentage >= 60) {
      return 'acceptable';
    } else if (coverage.coverage_percentage >= 40) {
      return 'poor';
    } else {
      return 'critical';
    }
  }

  /**
   * Generate recommendation based on coverage analysis
   */
  generateRecommendation(coverage, orphanedTests, uncoveredReqs) {
    const recommendations = [];

    if (coverage.coverage_percentage < 70) {
      recommendations.push('Increase test coverage to at least 70%');
    }

    if (orphanedTests.length > 0) {
      recommendations.push(`Link ${orphanedTests.length} orphaned tests to requirements`);
    }

    const criticalUncovered = uncoveredReqs.filter(r => r.priority === 'critical');
    if (criticalUncovered.length > 0) {
      recommendations.push(`Add tests for ${criticalUncovered.length} critical requirements immediately`);
    }

    if (coverage.implementation_percentage < coverage.coverage_percentage) {
      recommendations.push('Some requirements have tests but no implementation - review story creation');
    }

    return recommendations.length > 0
      ? recommendations.join('; ')
      : 'Coverage is healthy, continue maintaining current levels';
  }
}

module.exports = CoverageCalculator;