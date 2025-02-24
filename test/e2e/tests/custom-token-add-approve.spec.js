const { strict: assert } = require('assert');

const { convertToHexValue, withFixtures, openDapp } = require('../helpers');
const FixtureBuilder = require('../fixture-builder');
const { SMART_CONTRACTS } = require('../seeder/smart-contracts');

describe('Create token, approve token and approve token without gas', function () {
  const smartContract = SMART_CONTRACTS.HST;
  const ganacheOptions = {
    accounts: [
      {
        secretKey:
          '0x7C9529A67102755B7E6102D6D950AC5D5863C98713805CEC576B945B15B71EAC',
        balance: convertToHexValue(25000000000000000000),
      },
    ],
  };

  it('imports and renders the balance for the new token', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions,
        smartContract,
        title: this.test.title,
      },
      async ({ driver, contractRegistry }) => {
        const contractAddress = await contractRegistry.getContractAddress(
          smartContract,
        );
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        // create token
        await openDapp(driver, contractAddress);

        const windowHandles = await driver.getAllWindowHandles();
        const extension = windowHandles[0];

        // imports custom token from extension
        await driver.switchToWindow(extension);
        await driver.clickElement(`[data-testid="home__asset-tab"]`);
        await driver.clickElement({ tag: 'button', text: 'Tokens' });

        await driver.clickElement({ text: 'Import tokens', tag: 'button' });
        await driver.clickElement({
          text: 'Custom token',
          tag: 'button',
        });
        await driver.fill('#custom-address', contractAddress);
        await driver.waitForSelector('#custom-decimals');
        await driver.delay(2000);

        await driver.clickElement({
          text: 'Add custom token',
          tag: 'button',
        });

        await driver.delay(2000);
        await driver.clickElement({
          text: 'Import tokens',
          tag: 'button',
        });

        // renders balance for newly created token
        await driver.clickElement('.app-header__logo-container');
        await driver.clickElement({ tag: 'button', text: 'Tokens' });
        await driver.waitForSelector({
          css: '[data-testid="multichain-token-list-item-value"]',
          text: '10 TST',
        });
      },
    );
  });

  it('approves an already created token and displays the token approval data', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions,
        smartContract,
        title: this.test.title,
      },
      async ({ driver, contractRegistry }) => {
        const contractAddress = await contractRegistry.getContractAddress(
          smartContract,
        );
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        // create token
        await openDapp(driver, contractAddress);

        let windowHandles = await driver.getAllWindowHandles();
        const extension = windowHandles[0];

        await driver.findClickableElement('#deployButton');
        // approve token from dapp
        await driver.clickElement({ text: 'Approve Tokens', tag: 'button' });

        await driver.waitUntilXWindowHandles(3);
        windowHandles = await driver.getAllWindowHandles();
        await driver.switchToWindowWithTitle(
          'MetaMask Notification',
          windowHandles,
        );

        await driver.clickElement({
          text: 'Verify third-party details',
          css: '.token-allowance-container__verify-link',
        });

        const modalTitle = await driver.waitForSelector({
          text: 'Third-party details',
          tag: 'h5',
        });

        assert.equal(await modalTitle.getText(), 'Third-party details');

        await driver.clickElement({
          text: 'Got it',
          tag: 'button',
        });
        await driver.clickElement({
          text: 'View details',
          css: '.token-allowance-container__view-details',
        });

        // checks elements on approve token popup
        const functionType = await driver.findElement({
          text: 'Function: Approve',
          tag: 'h6',
        });
        assert.equal(await functionType.getText(), 'Function: Approve');

        const confirmDataDiv = await driver.findElement(
          '.approve-content-card-container__data__data-block',
        );
        const confirmDataText = await confirmDataDiv.getText();
        assert(
          confirmDataText.match(
            /0x095ea7b30000000000000000000000009bc5baf874d2da8d216ae9f137804184ee5afef4/u,
          ),
        );
        await driver.clickElement({ text: 'Next', tag: 'button' });

        await driver.findElement({
          text: 'Spending cap request for your ',
          css: '.box--flex-direction-row',
        });

        const defaultSpendingCap = await driver.findElement({
          text: '7 TST',
          css: '.box--flex-direction-row > h6',
        });

        assert.equal(
          await defaultSpendingCap.getText(),
          '7 TST',
          'Default value is not correctly set',
        );

        await driver.clickElement({
          text: 'Approve',
          tag: 'button',
        });

        await driver.switchToWindow(extension);
        await driver.clickElement({ tag: 'button', text: 'Activity' });

        // check list of pending transactions in extension
        await driver.wait(async () => {
          const pendingTxes = await driver.findElements(
            '.transaction-list-item',
          );
          return pendingTxes.length === 1;
        }, 10000);

        const approveTokenTask = await driver.waitForSelector({
          // Selects only the very first transaction list item immediately following the 'Pending' header
          css: '.transaction-list__completed-transactions .transaction-list-item:first-child .list-item__heading',
          text: 'Approve TST spending cap',
        });
        assert.equal(
          await approveTokenTask.getText(),
          'Approve TST spending cap',
        );
      },
    );
  });

  it('set custom spending cap, customizes gas, edit spending cap and checks transaction in transaction list', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions,
        smartContract,
        title: this.test.title,
      },
      async ({ driver, contractRegistry }) => {
        const contractAddress = await contractRegistry.getContractAddress(
          smartContract,
        );
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        // create token
        await openDapp(driver, contractAddress);

        let windowHandles = await driver.getAllWindowHandles();
        const extension = windowHandles[0];

        await driver.findClickableElement('#deployButton');

        // approve token from dapp
        await driver.clickElement({ text: 'Approve Tokens', tag: 'button' });

        await driver.waitUntilXWindowHandles(3);
        windowHandles = await driver.getAllWindowHandles();
        await driver.switchToWindowWithTitle(
          'MetaMask Notification',
          windowHandles,
        );

        // set custom spending cap
        let setSpendingCap = await driver.findElement(
          '[data-testid="custom-spending-cap-input"]',
        );
        await setSpendingCap.fill('5');

        await driver.clickElement({
          text: 'View details',
          css: '.token-allowance-container__view-details',
        });
        await driver.clickElement({
          text: 'Next',
          tag: 'button',
        });

        let spendingCap = await driver.findElement({
          text: '5 TST',
          css: '.box--flex-direction-row > h6',
        });

        assert.equal(
          await spendingCap.getText(),
          '5 TST',
          'Default value is not correctly set',
        );

        // editing gas fee
        const editBtn = await driver.findElements({
          text: 'Edit',
          class: 'btn-link > h6',
        });

        editBtn[1].click();

        await driver.clickElement({
          text: 'Edit suggested gas fee',
          tag: 'button',
        });
        const [gasLimitInput, gasPriceInput] = await driver.findElements(
          'input[type="number"]',
        );
        await gasPriceInput.clear();
        await gasPriceInput.fill('10');
        await gasLimitInput.clear();
        await gasLimitInput.fill('60001');
        await driver.clickElement({ text: 'Save', tag: 'button' });

        await driver.waitForSelector(
          {
            css: '.box--flex-direction-row > h6',
            text: '0.0006 ETH',
          },
          { timeout: 15000 },
        );

        // editing spending cap
        await driver.clickElement({
          class: '.review-spending-cap__heading-detail__button',
          text: 'Edit',
        });

        setSpendingCap = await driver.findElement(
          '[data-testid="custom-spending-cap-input"]',
        );
        await setSpendingCap.fill('9');

        await driver.clickElement({
          text: 'Next',
          tag: 'button',
        });

        spendingCap = await driver.findElement({
          text: '9 TST',
          css: '.box--flex-direction-row > h6',
        });
        assert.equal(
          await spendingCap.getText(),
          '9 TST',
          'Default value is not correctly set',
        );

        // submits the transaction
        await driver.clickElement({ text: 'Approve', tag: 'button' });

        // finds the transaction in transaction list
        await driver.switchToWindow(extension);
        await driver.clickElement({ tag: 'button', text: 'Activity' });

        await driver.wait(async () => {
          const pendingTxes = await driver.findElements(
            '.transaction-list-item',
          );
          return pendingTxes.length === 1;
        }, 10000);
        const approveTokenTask = await driver.waitForSelector({
          // Select only the heading of the first entry in the transaction list.
          css: '.transaction-list__completed-transactions .transaction-list-item:first-child .list-item__heading',
          text: 'Approve TST spending cap',
        });
        assert.equal(
          await approveTokenTask.getText(),
          'Approve TST spending cap',
        );
      },
    );
  });

  it('set maximum spending cap, submits the transaction and finds the transaction in the transactions list', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions,
        smartContract,
        title: this.test.title,
      },
      async ({ driver, contractRegistry }) => {
        const contractAddress = await contractRegistry.getContractAddress(
          smartContract,
        );
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        // create token
        await openDapp(driver, contractAddress);
        const windowHandles = await driver.getAllWindowHandles();
        const extension = windowHandles[0];

        await driver.findClickableElement('#deployButton');

        // approve token from dapp
        await driver.clickElement({ text: 'Approve Tokens', tag: 'button' });

        await driver.switchToWindow(extension);
        await driver.clickElement({ tag: 'button', text: 'Activity' });

        const pendingTxes = await driver.findElements(
          '.transaction-list__pending-transactions .transaction-list-item',
        );
        pendingTxes[0].click();

        // set max spending cap
        await driver.clickElement({
          css: '.custom-spending-cap__max',
          text: 'Max',
        });

        await driver.clickElement({
          tag: 'button',
          text: 'Next',
        });

        // checks the balance
        const balance = await driver.findElement({
          css: '.box--display-flex > h6',
          text: '10 TST',
        });

        const maxSpendingCap = await driver.findElement({
          text: '10 TST',
          css: '.box--flex-direction-row > h6',
        });

        assert.equal(
          await maxSpendingCap.getText(),
          await balance.getText(),
          'Max spending cap is not set corectly',
        );

        await driver.delay(500);
        await driver.clickElement({
          tag: 'button',
          text: 'Approve',
        });

        const approveTokenTask = await driver.waitForSelector({
          // Select only the heading of the first entry in the transaction list.
          css: '.transaction-list__completed-transactions .transaction-list-item:first-child .list-item__heading',
          text: 'Approve TST spending cap',
        });
        assert.equal(
          await approveTokenTask.getText(),
          'Approve TST spending cap',
        );
      },
    );
  });

  it('approves token without gas, set site suggested spending cap, submits the transaction and finds the transaction in the transactions list', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions,
        smartContract,
        title: this.test.title,
      },
      async ({ driver, contractRegistry }) => {
        const contractAddress = await contractRegistry.getContractAddress(
          smartContract,
        );
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        await openDapp(driver, contractAddress);
        const windowHandles = await driver.getAllWindowHandles();
        const extension = windowHandles[0];

        await driver.findClickableElement('#deployButton');
        // approve token without gas from dapp
        await driver.clickElement({
          text: 'Approve Tokens Without Gas',
          tag: 'button',
        });

        // switch to extension
        await driver.switchToWindow(extension);
        await driver.clickElement({ tag: 'button', text: 'Activity' });

        const pendingTxes = await driver.findElements('.transaction-list-item');
        pendingTxes[0].click();

        // set custom spending cap
        const spendingCap = await driver.findElement(
          '[data-testid="custom-spending-cap-input"]',
        );
        await spendingCap.fill('5');

        // set site suggested spending cap
        await driver.clickElement({
          text: 'Use site suggestion',
          css: '.mm-button-link',
        });
        await driver.clickElement({
          text: 'Next',
          tag: 'button',
        });

        await driver.delay(500);
        await driver.clickElement({ text: 'Approve', tag: 'button' });

        // check transaction in Activity tab
        const approveTokenTask = await driver.waitForSelector({
          css: '.transaction-list__completed-transactions .transaction-list-item:first-child .list-item__heading',
          text: 'Approve TST spending cap',
        });
        assert.equal(
          await approveTokenTask.getText(),
          'Approve TST spending cap',
        );
      },
    );
  });
});
