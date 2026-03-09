CREATE TABLE privileges (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    brand VARCHAR(255) NOT NULL, 
    offer VARCHAR(255) NOT NULL, 
    description TEXT NOT NULL, 
    icon VARCHAR(255) NOT NULL, 
    variant VARCHAR(50) DEFAULT 'gold', 
    expires_in VARCHAR(255), 
    is_active TINYINT(1) DEFAULT 1, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO privileges (brand, offer, description, icon, variant, expires_in) VALUES 
('Louis Vuitton', '20% Off Exclusive Collection', 'Members-only access to the Spring 2024 collection with complimentary gift wrapping', 'ShoppingBag', 'gold', '5 days left'),
('Rolex', 'VIP Private Viewing', 'Exclusive invitation to preview the new Oyster Perpetual collection', 'Watch', 'platinum', '2 weeks'),
('Emirates', 'Complimentary Lounge Access', 'Unlimited first-class lounge access for you and a guest at all airports', 'Plane', 'emerald', NULL),
('Tiffany & Co', 'Double Points Weekend', 'Earn 2x points on all jewelry purchases this weekend only', 'Diamond', 'rose', '3 days');
