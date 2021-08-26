import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import Marketplace from '../abis/Marketplace.json'
import NavBar from './NavBar'
import Main from './Main'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true,
      markteplace: null,
    }

    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
  }

  createProduct(name, price) {
    this.setState({ loading: true })
    this.state.markteplace.methods
      .createProduct(name, price)
      .send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: true })
      })
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true })
    this.state.markteplace.methods
      .purchaseProduct(id)
      .send({ from: this.state.account, value: price })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      )
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load accounts
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    //Load contract
    const networkId = await web3.eth.net.getId()
    const networkData = Marketplace.networks[networkId]
    if (networkData) {
      const markteplace = web3.eth.Contract(
        Marketplace.abi,
        networkData.address
      )
      const productCount = await markteplace.methods.productCount().call()
      this.setState({ productCount: productCount.toString() })

      for (let index = 1; index <= productCount; index++) {
        const product = await markteplace.methods.products(index).call()
        console.log(product)
        this.setState({
          products: [...this.state.products, product]
        })
      }
      console.log(this.state.products)

      this.setState({ markteplace })
      this.setState({ loading: false })
    } else {
      alert('Contract Marketplace not found in the current network')
    }
  }

  render() {
    return (
      <div>
        <NavBar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
                {this.state.loading ? (
                  <div id="loader" className="text-center">
                    <p className="text-center">Loading... </p>
                  </div>
                ) : (
                  <Main
                    products={this.state.products}
                    createProduct={this.createProduct}
                    purchaseProduct={this.purchaseProduct}
                  />
                )}
            </main>
          </div>
        </div>
      </div>
    )
  }
}

export default App
