import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Wallet, Coins, Vote, Link, Image, Sparkles } from "lucide-react";

export function CryptoWalletDashboard() {
  const wallet = { address: "0x1234...5678", balance: 2.5, tokens: 15000, nfts: 8 };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Crypto Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-center">
          <p className="text-sm text-muted-foreground mb-1">{wallet.address}</p>
          <p className="text-3xl font-bold">{wallet.balance} ETH</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-bold">{wallet.tokens.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">RCOL Tokens</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-bold">{wallet.nfts}</p>
            <p className="text-xs text-muted-foreground">NFTs</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" size="sm">Send</Button>
          <Button className="flex-1" size="sm" variant="outline">Receive</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function NFTGallery() {
  const nfts = [
    { name: "Achievement #1", collection: "ResearchCollabPro", rarity: "rare" },
    { name: "Top Performer", collection: "Badges", rarity: "legendary" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          NFT Collection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nfts.map((nft, i) => (
          <div key={i} className="p-3 rounded-lg border flex justify-between items-center">
            <div>
              <p className="font-medium">{nft.name}</p>
              <p className="text-sm text-muted-foreground">{nft.collection}</p>
            </div>
            <Badge variant={nft.rarity === "legendary" ? "default" : "secondary"}>
              {nft.rarity}
            </Badge>
          </div>
        ))}
        <Button variant="outline" className="w-full">View Full Gallery</Button>
      </CardContent>
    </Card>
  );
}

export function DAOGovernance() {
  const dao = { name: "RCollab DAO", treasury: 1.5, proposals: 3, votingPower: 1000 };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Vote className="h-5 w-5 text-primary" />
          DAO Governance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="font-medium">{dao.name}</p>
          <p className="text-2xl font-bold mt-1">PKR {dao.treasury}M Treasury</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded border text-center">
            <p className="text-xl font-bold">{dao.proposals}</p>
            <p className="text-xs text-muted-foreground">Active Proposals</p>
          </div>
          <div className="p-3 rounded border text-center">
            <p className="text-xl font-bold">{dao.votingPower}</p>
            <p className="text-xs text-muted-foreground">Voting Power</p>
          </div>
        </div>
        <Button className="w-full">View Proposals</Button>
      </CardContent>
    </Card>
  );
}

export function DeFiPositions() {
  const positions = [
    { protocol: "Uniswap", type: "Liquidity", value: 5000, apy: 12.5 },
    { protocol: "Aave", type: "Lending", value: 10000, apy: 4.2 },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          DeFi Positions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {positions.map((pos, i) => (
          <div key={i} className="p-3 rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{pos.protocol}</p>
                <p className="text-sm text-muted-foreground">{pos.type}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">PKR {pos.value.toLocaleString()}</p>
                <p className="text-sm text-green-600">{pos.apy}% APY</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function Web3Identity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Link className="h-5 w-5 text-primary" />
          Web3 Identity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <p className="font-medium">yourname.eth</p>
          <p className="text-sm text-muted-foreground">Primary ENS Domain</p>
        </div>
        <div className="flex gap-2">
          <Badge>3 SBTs</Badge>
          <Badge variant="secondary">5 POAPs</Badge>
          <Badge variant="outline">Verified</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function TokenStaking() {
  const staking = { staked: 5000, rewards: 250, apy: 8.5 };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Token Staking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 rounded-lg bg-yellow-500/10">
          <p className="text-3xl font-bold">{staking.staked} RCOL</p>
          <p className="text-sm text-muted-foreground">Total Staked</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded border text-center">
            <p className="text-xl font-bold text-green-600">{staking.rewards}</p>
            <p className="text-xs text-muted-foreground">Pending Rewards</p>
          </div>
          <div className="p-3 rounded border text-center">
            <p className="text-xl font-bold text-blue-600">{staking.apy}%</p>
            <p className="text-xs text-muted-foreground">APY</p>
          </div>
        </div>
        <Button className="w-full">Claim Rewards</Button>
      </CardContent>
    </Card>
  );
}
