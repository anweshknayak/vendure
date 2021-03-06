import { Column, Entity, ManyToOne } from 'typeorm';

import { Adjustment, AdjustmentType } from '../../../../shared/generated-types';
import { DeepPartial } from '../../../../shared/shared-types';
import { AdjustmentSource } from '../../common/types/adjustment-source';
import { idsAreEqual } from '../../common/utils';
import { CustomerGroup } from '../customer-group/customer-group.entity';
import { TaxCategory } from '../tax-category/tax-category.entity';
import { Zone } from '../zone/zone.entity';

@Entity()
export class TaxRate extends AdjustmentSource {
    readonly type = AdjustmentType.TAX;

    constructor(input?: DeepPartial<TaxRate>) {
        super(input);
    }

    @Column() name: string;

    @Column() enabled: boolean;

    @Column() value: number;

    @ManyToOne(type => TaxCategory)
    category: TaxCategory;

    @ManyToOne(type => Zone)
    zone: Zone;

    @ManyToOne(type => CustomerGroup, { nullable: true })
    customerGroup?: CustomerGroup;

    /**
     * Returns the tax component of a given gross price.
     */
    taxComponentOf(grossPrice: number): number {
        return Math.round(grossPrice - grossPrice / ((100 + this.value) / 100));
    }

    /**
     * Given a gross (tax-inclusive) price, returns the net price.
     */
    netPriceOf(grossPrice: number): number {
        return grossPrice - this.taxComponentOf(grossPrice);
    }

    /**
     * Returns the tax applicable to the given net price.
     */
    taxPayableOn(netPrice: number): number {
        return Math.round(netPrice * (this.value / 100));
    }

    /**
     * Given a net price, return the gross price (net + tax)
     */
    grossPriceOf(netPrice: number): number {
        return netPrice + this.taxPayableOn(netPrice);
    }

    apply(price: number): Adjustment {
        return {
            type: this.type,
            adjustmentSource: this.getSourceId(),
            description: this.name,
            amount: this.taxPayableOn(price),
        };
    }

    test(zone: Zone, taxCategory: TaxCategory): boolean {
        return idsAreEqual(taxCategory.id, this.category.id) && idsAreEqual(zone.id, this.zone.id);
    }
}
