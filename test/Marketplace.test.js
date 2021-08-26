const Marketplace = artifacts.require('./Marketplace.sol')

import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Web3 from 'web3'

chai.use(chaiAsPromised).should()

contract('Marketplace', ([deployer, seller, buyer]) => {
  let marketplace

  before(async () => {
    marketplace = await Marketplace.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfuly', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'Marketplace contract built by Derick')
      assert.notEqual(name, '')
      assert.notEqual(name, null)
      assert.notEqual(name, undefined)
    })
  })

  describe('products', async () => {
    let result, productCount
    before(async () => {
      result = await marketplace.createProduct(
        'Rubiks Cube',
        web3.utils.toWei('1', 'Ether'),
        { from: seller }
      )
      productCount = await marketplace.productCount()
    })

    it('creates products', async () => {
      assert.equal(productCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'Rubiks Cube', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'account is correct')
      assert.equal(event.purchased, false, 'purchased is correct')

      //Failure tests

      await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), {
        from: seller,
      }).should.be.rejected;
      await marketplace.createProduct('IPhone', 0, {
        from: seller,
      }).should.be.rejected;
    })

    it('lists products', async () => {    
      const product = await marketplace.products(productCount)
      assert.equal(product.name, 'Rubiks Cube', 'name is correct')
      assert.equal(product.price, '1000000000000000000', 'price is correct')
      assert.equal(product.owner, seller, 'account is correct')
      assert.equal(product.purchased, false, 'purchased is correct')
    })

    it('sells products', async () => {
      let sellerOldBalance = await web3.eth.getBalance(seller)
      sellerOldBalance = new web3.utils.BN(sellerOldBalance)

      result = await marketplace.purchaseProduct(
        productCount,
        { from: buyer, value: web3.utils.toWei('1', 'Ether')}
      )
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'Rubiks Cube', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, buyer, 'account is correct')
      assert.equal(event.purchased, true, 'purchased is correct')

      //Check if the seller received the funds
      let sellerNewBalance = await web3.eth.getBalance(seller)
      sellerNewBalance = new web3.utils.BN(sellerNewBalance)

      let price = web3.utils.toWei('1', 'Ether')
      price = new web3.utils.BN(price)

      let sellerExpectedBalance = sellerOldBalance.add(price)

      assert.equal(sellerNewBalance.toString(), sellerExpectedBalance.toString())

      //Validations
      //Invalid price
      await marketplace.purchaseProduct(
        productCount,
        { from: buyer, value: web3.utils.toWei('2', 'Ether')}
      ).should.be.rejected;
      //Invalid id
      await marketplace.purchaseProduct(
        5,
        { from: buyer, value: web3.utils.toWei('1', 'Ether')}
      ).should.be.rejected;
    })

  })
})
