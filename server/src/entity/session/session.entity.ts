import { Column, Entity, Index, ManyToOne, TableInheritance } from 'typeorm';

import { DeepPartial } from '../../../../shared/shared-types';
import { VendureEntity } from '../base/base.entity';
import { Customer } from '../customer/customer.entity';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Session extends VendureEntity {
    @Index({ unique: true })
    @Column()
    token: string;

    @Column() expires: Date;

    @Column() invalidated: boolean;

    @ManyToOne(type => Order)
    activeOrder: Order | null;
}
