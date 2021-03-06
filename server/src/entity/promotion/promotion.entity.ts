import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { Adjustment, AdjustmentOperation, AdjustmentType } from '../../../../shared/generated-types';
import { DeepPartial } from '../../../../shared/shared-types';
import { AdjustmentSource } from '../../common/types/adjustment-source';
import { ChannelAware } from '../../common/types/common-types';
import { getConfig } from '../../config/config-helpers';
import { PromotionItemAction, PromotionOrderAction } from '../../config/promotion/promotion-action';
import { PromotionCondition } from '../../config/promotion/promotion-condition';
import { Channel } from '../channel/channel.entity';
import { OrderItem } from '../order-item/order-item.entity';
import { OrderLine } from '../order-line/order-line.entity';
import { Order } from '../order/order.entity';

@Entity()
export class Promotion extends AdjustmentSource implements ChannelAware {
    type = AdjustmentType.PROMOTION;
    private readonly allConditions: { [code: string]: PromotionCondition } = {};
    private readonly allActions: { [code: string]: PromotionItemAction | PromotionOrderAction } = {};

    constructor(input?: DeepPartial<Promotion>) {
        super(input);
        const conditions = getConfig().promotionOptions.promotionConditions || [];
        const actions = getConfig().promotionOptions.promotionActions || [];
        this.allConditions = conditions.reduce((hash, o) => ({ ...hash, [o.code]: o }), {});
        this.allActions = actions.reduce((hash, o) => ({ ...hash, [o.code]: o }), {});
    }

    @Column() name: string;

    @Column() enabled: boolean;

    @ManyToMany(type => Channel)
    @JoinTable()
    channels: Channel[];

    @Column('simple-json') conditions: AdjustmentOperation[];

    @Column('simple-json') actions: AdjustmentOperation[];

    /**
     * The PriorityScore is used to determine the sequence in which multiple promotions are tested
     * on a given order. A higher number moves the Promotion towards the end of the sequence.
     *
     * The score is derived from the sum of the priorityValues of the PromotionConditions and
     * PromotionActions comprising this Promotion.
     *
     * An example illustrating the need for a priority is this:
     *
     * Consider 2 Promotions, 1) buy 1 get one free and 2) 10% off when order total is over $50.
     * If Promotion 2 is evaluated prior to Promotion 1, then it can trigger the 10% discount even
     * if the subsequent application of Promotion 1 brings the order total down to way below $50.
     */
    @Column() priorityScore: number;

    apply(order: Order): Adjustment | undefined;
    apply(orderItem: OrderItem, orderLine: OrderLine): Adjustment | undefined;
    apply(orderItemOrOrder: OrderItem | Order, orderLine?: OrderLine): Adjustment | undefined {
        let amount = 0;

        for (const action of this.actions) {
            const promotionAction = this.allActions[action.code];
            if (this.isItemAction(promotionAction)) {
                if (orderItemOrOrder instanceof OrderItem && orderLine) {
                    amount += Math.round(promotionAction.execute(orderItemOrOrder, orderLine, action.args));
                }
            } else {
                if (orderItemOrOrder instanceof Order) {
                    amount += Math.round(promotionAction.execute(orderItemOrOrder, action.args));
                }
            }
        }
        if (amount !== 0) {
            return {
                amount,
                type: this.type,
                description: this.name,
                adjustmentSource: this.getSourceId(),
            };
        }
    }

    test(order: Order): boolean {
        for (const condition of this.conditions) {
            const promotionCondition = this.allConditions[condition.code];
            if (!promotionCondition || !promotionCondition.check(order, condition.args)) {
                return false;
            }
        }
        return true;
    }

    private isItemAction(value: PromotionItemAction | PromotionOrderAction): value is PromotionItemAction {
        return value instanceof PromotionItemAction;
    }
}
