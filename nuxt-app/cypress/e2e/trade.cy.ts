describe('Trade flow', () => {
  it('creates a deal and confirms a milestone', () => {
    cy.intercept('POST', '/api/deals', {
      statusCode: 200,
      body: { dealId: 1, contractHash: '0x123' },
    }).as('createDeal')

    cy.intercept('GET', '/api/deals/1', {
      statusCode: 200,
      body: {
        deal: { id: 1 },
        milestones: [{ id: 1, description: 'Shipment', status: 'PENDING' }],
      },
    }).as('getDeal')

    cy.intercept('POST', '/api/milestones/1/confirm', {
      statusCode: 200,
      body: {},
    }).as('confirmMilestone')

    cy.visit('/deal-creation')

    cy.contains('label', 'Amount').parent().find('input').type('1000')
    cy.contains('label', 'Currency').parent().find('select').select('USD')
    cy.contains('label', 'Incoterms').parent().find('input').type('FOB')
    cy.contains('label', 'Deposit %').parent().find('input').type('10')
    cy.contains('label', 'Milestones').parent().find('input').first().type('Shipment')
    cy.contains('label', 'Seller').parent().find('input').type('Alice')
    cy.contains('label', 'Guarantor').parent().find('input').type('Bob')
    cy.contains('label', 'Insurer').parent().find('input').type('Charlie')

    cy.contains('button', 'Create').click()
    cy.wait('@createDeal')
    cy.url().should('include', '/deals/1')
    cy.wait('@getDeal')

    cy.contains('button', 'Confirm').click()
    cy.wait('@confirmMilestone')
    cy.contains('td', 'CONFIRMED')
  })
})
