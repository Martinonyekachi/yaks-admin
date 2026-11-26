function transaction({
  id, customer, email, phone, date, method, amount, type, status, initials, color,
  gatewayReference, fee,
}) {
  const happenedAt = new Date(date)
  const createdAt = new Date(happenedAt.getTime() - 3 * 60 * 1000)
  const history = [
    { title: 'Payment initiated', detail: 'Customer submitted payment details', date: createdAt.toISOString() },
  ]

  if (status === 'Pending') {
    history.push({ title: 'Awaiting settlement', detail: 'Payment confirmation is pending', date: happenedAt.toISOString() })
  } else if (status === 'Failed') {
    history.push({ title: 'Payment declined', detail: 'The payment provider did not authorize this transaction', date: happenedAt.toISOString() })
  } else {
    history.push({ title: 'Payment successful', detail: 'Funds confirmed by the payment provider', date: happenedAt.toISOString() })
    if (status === 'Refunded') {
      history.push({ title: 'Refund issued', detail: 'Full refund returned to the original payment method', date: new Date(happenedAt.getTime() + 60 * 60 * 1000).toISOString() })
    }
  }

  return {
    id,
    reference: `YAK-${id.slice(-6)}-${gatewayReference.slice(-4)}`,
    customer: { name: customer, email, phone },
    date,
    method,
    amount,
    type,
    status,
    initials,
    color,
    gatewayReference,
    fee,
    history,
    refundedAmount: status === 'Refunded' ? amount : 0,
  }
}

export const initialTransactions = [
  transaction({ id: 'TXN-260291', customer: 'Olivia Rhye', email: 'olivia@northstar.ng', phone: '+234 803 555 0142', date: '2026-11-26T14:35:00+01:00', method: 'Visa', amount: 2450000, type: 'Subscription', status: 'Successful', initials: 'OR', color: 'peach', gatewayReference: 'PSK-784231', fee: 36750 }),
  transaction({ id: 'TXN-260290', customer: 'Phoenix Baker', email: 'phoenix@northstar.ng', phone: '+234 806 244 9018', date: '2026-11-26T11:18:00+01:00', method: 'Mastercard', amount: 890000, type: 'Project payment', status: 'Pending', initials: 'PB', color: 'purple', gatewayReference: 'PSK-784208', fee: 13350 }),
  transaction({ id: 'TXN-260289', customer: 'Lana Steiner', email: 'lana@northstar.ng', phone: '+234 809 740 2186', date: '2026-11-25T16:42:00+01:00', method: 'Bank transfer', amount: 1240000, type: 'Invoice', status: 'Successful', initials: 'LS', color: 'mint', gatewayReference: 'TRF-510894', fee: 250 }),
  transaction({ id: 'TXN-260288', customer: 'Demi Wilkinson', email: 'demi@northstar.ng', phone: '+234 802 617 3041', date: '2026-11-25T10:07:00+01:00', method: 'Paystack', amount: 320000, type: 'Subscription', status: 'Failed', initials: 'DW', color: 'blue', gatewayReference: 'PSK-783994', fee: 0 }),
  transaction({ id: 'TXN-260287', customer: 'Candice Wu', email: 'candice@northstar.ng', phone: '+234 807 445 1632', date: '2026-11-24T13:26:00+01:00', method: 'Visa', amount: 3180000, type: 'Project payment', status: 'Successful', initials: 'CW', color: 'gold', gatewayReference: 'PSK-783710', fee: 47700 }),
  transaction({ id: 'TXN-260286', customer: 'Natali Craig', email: 'natali@northstar.ng', phone: '+234 805 218 7420', date: '2026-11-23T09:52:00+01:00', method: 'Mastercard', amount: 760000, type: 'Add-on', status: 'Successful', initials: 'NC', color: 'pink', gatewayReference: 'PSK-783518', fee: 11400 }),
  transaction({ id: 'TXN-260285', customer: 'Drew Cano', email: 'drew@northstar.ng', phone: '+234 810 371 0059', date: '2026-11-22T17:11:00+01:00', method: 'Bank transfer', amount: 1180000, type: 'Invoice', status: 'Pending', initials: 'DC', color: 'green', gatewayReference: 'TRF-510621', fee: 250 }),
  transaction({ id: 'TXN-260284', customer: 'Andi Lane', email: 'andi@northstar.ng', phone: '+234 803 951 4286', date: '2026-11-20T12:04:00+01:00', method: 'Paystack', amount: 560000, type: 'Subscription', status: 'Successful', initials: 'AL', color: 'lavender', gatewayReference: 'PSK-782966', fee: 8400 }),
  transaction({ id: 'TXN-260283', customer: 'Kate Morrison', email: 'kate@northstar.ng', phone: '+234 809 622 0175', date: '2026-11-18T15:40:00+01:00', method: 'Visa', amount: 940000, type: 'Project payment', status: 'Failed', initials: 'KM', color: 'rose', gatewayReference: 'PSK-782531', fee: 0 }),
  transaction({ id: 'TXN-260282', customer: 'John Smith', email: 'john@northstar.ng', phone: '+234 806 128 9960', date: '2026-11-15T08:30:00+01:00', method: 'Bank transfer', amount: 1650000, type: 'Invoice', status: 'Successful', initials: 'JS', color: 'slate', gatewayReference: 'TRF-510302', fee: 250 }),
  transaction({ id: 'TXN-260281', customer: 'Osuji Martin', email: 'martinosuji104@gmail.com', phone: '+234 803 104 1040', date: '2026-11-12T10:16:00+01:00', method: 'Visa', amount: 4250000, type: 'Subscription', status: 'Successful', initials: 'OM', color: 'lavender', gatewayReference: 'PSK-781602', fee: 63750 }),
  transaction({ id: 'TXN-260280', customer: 'Olivia Rhye', email: 'olivia@northstar.ng', phone: '+234 803 555 0142', date: '2026-11-10T14:22:00+01:00', method: 'Paystack', amount: 1340000, type: 'Project payment', status: 'Refunded', initials: 'OR', color: 'peach', gatewayReference: 'PSK-781190', fee: 20100 }),
  transaction({ id: 'TXN-260279', customer: 'Phoenix Baker', email: 'phoenix@northstar.ng', phone: '+234 806 244 9018', date: '2026-10-29T11:05:00+01:00', method: 'Mastercard', amount: 675000, type: 'Add-on', status: 'Successful', initials: 'PB', color: 'purple', gatewayReference: 'PSK-779010', fee: 10125 }),
  transaction({ id: 'TXN-260278', customer: 'Lana Steiner', email: 'lana@northstar.ng', phone: '+234 809 740 2186', date: '2026-10-18T16:53:00+01:00', method: 'Bank transfer', amount: 2200000, type: 'Subscription', status: 'Successful', initials: 'LS', color: 'mint', gatewayReference: 'TRF-508813', fee: 250 }),
  transaction({ id: 'TXN-260277', customer: 'Demi Wilkinson', email: 'demi@northstar.ng', phone: '+234 802 617 3041', date: '2026-10-11T09:47:00+01:00', method: 'Paystack', amount: 410000, type: 'Invoice', status: 'Failed', initials: 'DW', color: 'blue', gatewayReference: 'PSK-777420', fee: 0 }),
  transaction({ id: 'TXN-260276', customer: 'Candice Wu', email: 'candice@northstar.ng', phone: '+234 807 445 1632', date: '2026-09-24T13:13:00+01:00', method: 'Visa', amount: 2850000, type: 'Project payment', status: 'Successful', initials: 'CW', color: 'gold', gatewayReference: 'PSK-774185', fee: 42750 }),
  transaction({ id: 'TXN-260275', customer: 'Natali Craig', email: 'natali@northstar.ng', phone: '+234 805 218 7420', date: '2026-09-05T10:38:00+01:00', method: 'Bank transfer', amount: 1320000, type: 'Subscription', status: 'Pending', initials: 'NC', color: 'pink', gatewayReference: 'TRF-505714', fee: 250 }),
  transaction({ id: 'TXN-260274', customer: 'Drew Cano', email: 'drew@northstar.ng', phone: '+234 810 371 0059', date: '2026-08-19T15:09:00+01:00', method: 'Paystack', amount: 720000, type: 'Invoice', status: 'Successful', initials: 'DC', color: 'green', gatewayReference: 'PSK-769220', fee: 10800 }),
  transaction({ id: 'TXN-260273', customer: 'Andi Lane', email: 'andi@northstar.ng', phone: '+234 803 951 4286', date: '2026-07-27T12:28:00+01:00', method: 'Mastercard', amount: 1980000, type: 'Project payment', status: 'Refunded', initials: 'AL', color: 'lavender', gatewayReference: 'PSK-764931', fee: 29700 }),
  transaction({ id: 'TXN-260272', customer: 'Kate Morrison', email: 'kate@northstar.ng', phone: '+234 809 622 0175', date: '2026-07-08T09:14:00+01:00', method: 'Visa', amount: 590000, type: 'Add-on', status: 'Successful', initials: 'KM', color: 'rose', gatewayReference: 'PSK-760805', fee: 8850 }),
  transaction({ id: 'TXN-260271', customer: 'John Smith', email: 'john@northstar.ng', phone: '+234 806 128 9960', date: '2026-06-16T14:03:00+01:00', method: 'Bank transfer', amount: 3470000, type: 'Subscription', status: 'Successful', initials: 'JS', color: 'slate', gatewayReference: 'TRF-498340', fee: 250 }),
  transaction({ id: 'TXN-260270', customer: 'Osuji Martin', email: 'martinosuji104@gmail.com', phone: '+234 803 104 1040', date: '2026-06-03T11:32:00+01:00', method: 'Paystack', amount: 860000, type: 'Invoice', status: 'Successful', initials: 'OM', color: 'lavender', gatewayReference: 'PSK-754102', fee: 12900 }),
]

export const paymentMethods = ['Visa', 'Mastercard', 'Bank transfer', 'Paystack']
export const transactionTypes = ['Subscription', 'Project payment', 'Invoice', 'Add-on']
export const transactionStatuses = ['Successful', 'Pending', 'Failed', 'Refunded']
export const paymentMethodColors = {
  Visa: '#5685ff',
  Mastercard: '#8f80d8',
  'Bank transfer': '#62c6a5',
  Paystack: '#e8b65b',
}
