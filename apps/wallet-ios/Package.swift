// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "NorWallet",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "NorWallet",
            targets: ["NorWallet"]),
    ],
    dependencies: [
        .package(path: "Packages/NorCore")
    ],
    targets: [
        .target(
            name: "NorWallet",
            dependencies: [
                .product(name: "NorCore", package: "NorCore")
            ]),
        .testTarget(
            name: "NorWalletTests",
            dependencies: ["NorWallet"]
        ),
    ]
)
