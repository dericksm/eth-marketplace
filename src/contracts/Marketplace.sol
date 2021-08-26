pragma solidity >=0.5.0;

contract Marketplace {
    string public name;
    mapping(uint => Product) public products;
    uint public productCount = 0;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated (
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased (
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Marketplace contract built by Derick"; 
    }

    function createProduct(string memory _name, uint _price) public {
        //name validation
        require(bytes(_name).length > 0);
        //price validation
        require(_price > 0);
        productCount ++;
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }
    
    function purchaseProduct(uint _id) public payable {
        //Id validation
        require(_id > 0 && _id < productCount);
        // Fetch the product
        Product memory _product = products[_id];
        // Fetch the owner
        address payable _seller = _product.owner;
        bool _purchased = _product.purchased;

        //Make sure that it isn't purchased;
        require(_purchased != true);
        //Validate if the amount of ether is equal to the product price
        require(_product.price == msg.value);
        //Validate if the buyer is not the seller
        require(_product.owner != msg.sender);
        
        // Transfer the onwership and update the product at the blockchain
        _product.owner = msg.sender;
        _product.purchased = true;
        products[_id] = _product;
        // Pat the seller
        address(_seller).transfer(msg.value);

        emit ProductPurchased(_id, _product.name, _product.price, _product.owner, _product.purchased);

    }
}
