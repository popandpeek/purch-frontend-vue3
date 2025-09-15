import { VendorSelection } from '../../core/entities/VendorSelection';
import type { IVendorSelectionRepository } from '../../core/repositories/IVendorSelectionRepository';
import type { IProductRepository } from '../../core/repositories/IProductRepository';

export interface OverrideSelectionCommand {
  itemId: string | number;
  vendorItemId: number;
  overriddenBy: string;
}

export interface VendorSelectionAnalysis {
  totalSelections: number;
  overriddenSelections: number;
  averageConfidenceScore: number;
  totalCostSavings: number;
  strategyDistribution: Record<string, number>;
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Vendor Selection Service
 * Handles business logic for vendor selection operations
 */
export class VendorSelectionService {
  constructor(
    private vendorSelectionRepository: IVendorSelectionRepository
    // private productRepository: IProductRepository // Temporarily disabled
  ) {}

  /**
   * Get vendor selections for an order
   */
  async getVendorSelectionsForOrder(orderId: string | number): Promise<VendorSelection[]> {
    return await this.vendorSelectionRepository.findByOrderId(orderId);
  }

  /**
   * Get vendor selection for a specific house order item
   */
  async getVendorSelectionForItem(itemId: string | number): Promise<VendorSelection | null> {
    return await this.vendorSelectionRepository.findByHouseOrderItemId(itemId);
  }

  /**
   * Override a vendor selection
   */
  async overrideSelection(command: OverrideSelectionCommand): Promise<VendorSelection> {
    const selection = await this.vendorSelectionRepository.findByHouseOrderItemId(command.itemId);
    if (!selection) {
      throw new Error('Vendor selection not found');
    }

    // Use the repository method to override
    return await this.vendorSelectionRepository.overrideSelection(command.itemId, command.vendorItemId);
  }

  /**
   * Reset a vendor selection override
   */
  async resetOverride(itemId: string | number): Promise<VendorSelection> {
    const selection = await this.vendorSelectionRepository.findByHouseOrderItemId(itemId);
    if (!selection) {
      throw new Error('Vendor selection not found');
    }

    if (!selection.isOverridden) {
      throw new Error('Selection is not overridden');
    }

    return await this.vendorSelectionRepository.resetOverride(itemId);
  }

  /**
   * Get all overridden selections
   */
  async getOverriddenSelections(): Promise<VendorSelection[]> {
    return await this.vendorSelectionRepository.findOverriddenSelections();
  }

  /**
   * Get selections by strategy
   */
  async getSelectionsByStrategy(strategy: string): Promise<VendorSelection[]> {
    return await this.vendorSelectionRepository.findSelectionsByStrategy(strategy);
  }

  /**
   * Analyze vendor selection performance
   */
  async getVendorSelectionAnalysis(): Promise<VendorSelectionAnalysis> {
    const selections = await this.vendorSelectionRepository.findAll();
    
    if (selections.length === 0) {
      return {
        totalSelections: 0,
        overriddenSelections: 0,
        averageConfidenceScore: 0,
        totalCostSavings: 0,
        strategyDistribution: {},
        confidenceDistribution: { high: 0, medium: 0, low: 0 }
      };
    }

    const analysis = selections.reduce((acc, selection) => {
      acc.totalSelections++;
      
      if (selection.isOverridden) {
        acc.overriddenSelections++;
      }
      
      acc.averageConfidenceScore += selection.selectionReason.confidence_score;
      acc.totalCostSavings += selection.costSavings;
      
      // Strategy distribution
      const strategy = selection.selectionReason.strategy;
      acc.strategyDistribution[strategy] = (acc.strategyDistribution[strategy] || 0) + 1;
      
      // Confidence distribution
      const confidence = selection.getConfidenceLevel();
      acc.confidenceDistribution[confidence]++;
      
      return acc;
    }, {
      totalSelections: 0,
      overriddenSelections: 0,
      averageConfidenceScore: 0,
      totalCostSavings: 0,
      strategyDistribution: {} as Record<string, number>,
      confidenceDistribution: { high: 0, medium: 0, low: 0 }
    });

    // Calculate average confidence score
    analysis.averageConfidenceScore = analysis.averageConfidenceScore / analysis.totalSelections;

    return analysis;
  }

  /**
   * Get best performing strategy
   */
  async getBestPerformingStrategy(): Promise<string | null> {
    const analysis = await this.getVendorSelectionAnalysis();
    
    if (Object.keys(analysis.strategyDistribution).length === 0) {
      return null;
    }

    return Object.entries(analysis.strategyDistribution)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  /**
   * Get selection recommendations
   */
  async getSelectionRecommendations(): Promise<{
    lowConfidenceSelections: VendorSelection[];
    highSavingsSelections: VendorSelection[];
    overriddenSelections: VendorSelection[];
  }> {
    const selections = await this.vendorSelectionRepository.findAll();
    
    const lowConfidenceSelections = selections.filter(s => s.getConfidenceLevel() === 'low');
    const highSavingsSelections = selections
      .filter(s => s.costSavings > 50) // Arbitrary threshold
      .sort((a, b) => b.costSavings - a.costSavings);
    const overriddenSelections = selections.filter(s => s.isOverridden);

    return {
      lowConfidenceSelections,
      highSavingsSelections,
      overriddenSelections
    };
  }

  /**
   * Validate vendor selection
   */
  async validateSelection(selection: VendorSelection): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Check if the selected vendor item exists and is available
    // This would require integration with vendor item repository
    // For now, we'll do basic validation

    if (selection.selectionReason.confidence_score < 0.5) {
      errors.push('Confidence score is too low');
    }

    if (selection.costSavings < 0) {
      errors.push('Cost savings cannot be negative');
    }

    if (!selection.alternatives || selection.alternatives.length === 0) {
      errors.push('No alternatives available');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get selection statistics for a specific order
   */
  async getOrderSelectionStats(orderId: string | number): Promise<{
    totalItems: number;
    selectionsWithAlternatives: number;
    overriddenSelections: number;
    totalSavings: number;
    averageConfidence: number;
  }> {
    const selections = await this.vendorSelectionRepository.findByOrderId(orderId);
    
    if (selections.length === 0) {
      return {
        totalItems: 0,
        selectionsWithAlternatives: 0,
        overriddenSelections: 0,
        totalSavings: 0,
        averageConfidence: 0
      };
    }

    const stats = selections.reduce((acc, selection) => {
      acc.totalItems++;
      
      if (selection.hasAlternatives()) {
        acc.selectionsWithAlternatives++;
      }
      
      if (selection.isOverridden) {
        acc.overriddenSelections++;
      }
      
      acc.totalSavings += selection.costSavings;
      acc.averageConfidence += selection.selectionReason.confidence_score;
      
      return acc;
    }, {
      totalItems: 0,
      selectionsWithAlternatives: 0,
      overriddenSelections: 0,
      totalSavings: 0,
      averageConfidence: 0
    });

    stats.averageConfidence = stats.averageConfidence / stats.totalItems;

    return stats;
  }
}
