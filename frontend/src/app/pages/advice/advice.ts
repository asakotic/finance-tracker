import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { TransactionService } from '../../services/transaction-service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectorRef } from '@angular/core';

interface Transaction {
  id: number;
  date: string;
  category: string;
  amount: number;
  income: boolean;
}

interface AdviceMessage {
  text: string;
  type: 'positive' | 'warning' | 'neutral' | 'tip';
  priority: number;
}

interface SpendingAnalysis {
  category: string;
  amount: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

@Component({
  selector: 'app-advices',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgIf,
    NgFor,
    CurrencyPipe
  ],
  templateUrl: './advice.html',
  styleUrls: ['./advice.scss']
})
export class Advice implements OnInit {
  allTransactions: Transaction[] = [];
  monthlyIncome = 0;
  monthlyExpenses = 0;
  previousMonthIncome = 0;
  previousMonthExpenses = 0;
  adviceMessages: AdviceMessage[] = [];
  topSpendingCategories: SpendingAnalysis[] = [];
  savingsRate = 0;
  spendingTrend = 0;
  dailyAverage = 0;

  private categoryEmojis: { [key: string]: string } = {
    'groceries': '🛒',
    'food': '🛒',
    'restaurants': '🍽️',
    'dining': '🍽️',
    'entertainment': '🎬',
    'utilities': '⚡',
    'transport': '🚗',
    'transportation': '🚗',
    'fuel': '⛽',
    'shopping': '🛍️',
    'clothes': '👕',
    'health': '🏥',
    'medical': '🏥',
    'fitness': '💪',
    'education': '📚',
    'books': '📚',
    'subscriptions': '📱',
    'insurance': '🛡️',
    'rent': '🏠',
    'mortgage': '🏠',
    'housing': '🏠',
    'travel': '✈️',
    'vacation': '🏖️',
    'gifts': '🎁',
    'charity': '💝',
    'investments': '📈',
    'savings': '🏦',
    'salary': '💼',
    'freelance': '💻',
    'business': '🏢',
    'other': '💰'
  };

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadAllTransactions();
  }

  loadAllTransactions() {
    console.log('Loading transactions for financial analysis...');
    this.transactionService.getTransactions(0, 9999, 'date', 'desc', {})
      .subscribe(page => {
        this.allTransactions = page.content;
        console.log('Total transactions loaded:', this.allTransactions.length);

        if (this.allTransactions.length > 0) {
          this.performComprehensiveAnalysis();
        } else {
          this.handleNoTransactions();
        }
        this.cdr.detectChanges();
      }, error => {
        console.error('Error loading transactions:', error);
        this.adviceMessages = [{
          text: 'There was an error loading your financial data. Please try again later.',
          type: 'warning',
          priority: 1
        }];
        this.cdr.detectChanges();
      });
  }

  performComprehensiveAnalysis() {
    this.analyzeCurrentMonth();
    this.analyzePreviousMonth();
    this.analyzeSpendingPatterns();
    this.calculateMetrics();
    this.generateComprehensiveAdvice();
  }

  analyzeCurrentMonth() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const currentMonthTransactions = this.allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= thirtyDaysAgo;
    });

    this.monthlyIncome = currentMonthTransactions
      .filter(t => t.income)
      .reduce((sum, t) => sum + t.amount, 0);

    this.monthlyExpenses = currentMonthTransactions
      .filter(t => !t.income)
      .reduce((sum, t) => sum + t.amount, 0);

    this.dailyAverage = this.monthlyExpenses / 30;
  }

  analyzePreviousMonth() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const previousMonthTransactions = this.allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= sixtyDaysAgo && transactionDate < thirtyDaysAgo;
    });

    this.previousMonthIncome = previousMonthTransactions
      .filter(t => t.income)
      .reduce((sum, t) => sum + t.amount, 0);

    this.previousMonthExpenses = previousMonthTransactions
      .filter(t => !t.income)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  analyzeSpendingPatterns() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const recentTransactions = this.allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= thirtyDaysAgo && !t.income;
    });

    const spendingByCategory = recentTransactions.reduce((acc: { [key: string]: number }, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    this.topSpendingCategories = Object.entries(spendingByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / this.monthlyExpenses) * 100,
        trend: 'stable' as const // Would need more data to determine actual trend
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  calculateMetrics() {
    this.savingsRate = this.monthlyIncome > 0 ? 
      ((this.monthlyIncome - this.monthlyExpenses) / this.monthlyIncome) * 100 : 0;
    
    this.spendingTrend = this.previousMonthExpenses > 0 ? 
      ((this.monthlyExpenses - this.previousMonthExpenses) / this.previousMonthExpenses) * 100 : 0;
  }

  generateComprehensiveAdvice() {
    this.adviceMessages = [];

    // Overall financial health assessment
    this.addOverallHealthAdvice();
    
    // Income analysis
    this.addIncomeAdvice();
    
    // Spending analysis
    this.addSpendingAdvice();
    
    // Savings advice
    this.addSavingsAdvice();
    
    // Category-specific advice
    this.addCategorySpecificAdvice();
    
    // Motivational and goal-setting advice
    this.addMotivationalAdvice();
    
    // Sort by priority and limit to reasonable number
    this.adviceMessages.sort((a, b) => b.priority - a.priority);
    this.adviceMessages = this.adviceMessages.slice(0, 12);
  }

  addOverallHealthAdvice() {
    const difference = this.monthlyIncome - this.monthlyExpenses;
    
    if (difference > 0) {
      if (this.savingsRate >= 20) {
        this.adviceMessages.push({
          text: `🎉 Outstanding! You're saving ${this.savingsRate.toFixed(1)}% of your income. You're on the fast track to financial independence!`,
          type: 'positive',
          priority: 10
        });
      } else if (this.savingsRate >= 10) {
        this.adviceMessages.push({
          text: `💪 Great job! You're saving ${this.savingsRate.toFixed(1)}% of your income. Try to gradually increase this to 20% for even better financial security.`,
          type: 'positive',
          priority: 9
        });
      } else {
        this.adviceMessages.push({
          text: `✅ You're in the black with a ${this.savingsRate.toFixed(1)}% savings rate! Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`,
          type: 'positive',
          priority: 8
        });
      }
    } else if (difference < 0) {
      const overspendPercentage = Math.abs(difference / this.monthlyIncome) * 100;
      if (overspendPercentage > 20) {
        this.adviceMessages.push({
          text: `🚨 Alert: You're spending ${overspendPercentage.toFixed(1)}% more than you earn. This requires immediate action to avoid financial trouble.`,
          type: 'warning',
          priority: 10
        });
      } else {
        this.adviceMessages.push({
          text: `⚠️ You're overspending by ${Math.abs(difference).toFixed(0)} this month. Let's create a plan to get back on track!`,
          type: 'warning',
          priority: 9
        });
      }
    }
  }

  addIncomeAdvice() {
    const incomeChange = this.monthlyIncome - this.previousMonthIncome;
    const incomeChangePercentage = this.previousMonthIncome > 0 ? 
      (incomeChange / this.previousMonthIncome) * 100 : 0;

    if (incomeChange > 0 && incomeChangePercentage > 5) {
      this.adviceMessages.push({
        text: `📈 Your income increased by ${incomeChangePercentage.toFixed(1)}%! Consider putting this extra money directly into savings or investments.`,
        type: 'positive',
        priority: 7
      });
    } else if (incomeChange < 0 && Math.abs(incomeChangePercentage) > 5) {
      this.adviceMessages.push({
        text: `📉 Your income decreased by ${Math.abs(incomeChangePercentage).toFixed(1)}%. Focus on essential expenses and consider ways to supplement your income.`,
        type: 'warning',
        priority: 8
      });
    }

    if (this.monthlyIncome > 0) {
      this.adviceMessages.push({
        text: `💡 Pro tip: Consider setting up automatic transfers to save money before you even see it. "Pay yourself first" is a powerful wealth-building strategy.`,
        type: 'tip',
        priority: 5
      });
    }
  }

  addSpendingAdvice() {
    const spendingChangePercentage = this.previousMonthExpenses > 0 ? 
      this.spendingTrend : 0;

    if (spendingChangePercentage > 10) {
      this.adviceMessages.push({
        text: `📊 Your spending increased by ${spendingChangePercentage.toFixed(1)}% compared to last month. Review what drove this increase.`,
        type: 'warning',
        priority: 7
      });
    } else if (spendingChangePercentage < -10) {
      this.adviceMessages.push({
        text: `🎯 Excellent! You reduced your spending by ${Math.abs(spendingChangePercentage).toFixed(1)}% this month. Keep up the great discipline!`,
        type: 'positive',
        priority: 8
      });
    }

    if (this.dailyAverage > 0) {
      this.adviceMessages.push({
        text: `📱 Your daily average spending is ${this.dailyAverage.toFixed(2)}. Try the "24-hour rule" - wait a day before non-essential purchases over $50.`,
        type: 'tip',
        priority: 4
      });
    }
  }

  addSavingsAdvice() {
    if (this.savingsRate < 5 && this.monthlyIncome > this.monthlyExpenses) {
      this.adviceMessages.push({
        text: `🏦 Start small: Save just 1% of your income this month, then increase by 1% each month until you reach 10-20%.`,
        type: 'tip',
        priority: 6
      });
    }

    if (this.monthlyIncome > this.monthlyExpenses) {
      const monthsToEmergencyFund = this.monthlyExpenses > 0 ? 
        Math.ceil((this.monthlyExpenses * 3) / (this.monthlyIncome - this.monthlyExpenses)) : 0;
      
      if (monthsToEmergencyFund > 0 && monthsToEmergencyFund <= 24) {
        this.adviceMessages.push({
          text: `🛡️ At your current savings rate, you could build a 3-month emergency fund in ${monthsToEmergencyFund} months. This should be your first priority!`,
          type: 'neutral',
          priority: 7
        });
      }
    }
  }

  addCategorySpecificAdvice() {
    this.topSpendingCategories.forEach((category, index) => {
      if (index < 3) { // Only top 3 categories
        const emoji = this.getCategoryEmoji(category.category);
        const advice = this.getCategoryAdvice(category);
        if (advice) {
          this.adviceMessages.push({
            text: `${emoji} ${advice}`,
            type: category.percentage > 30 ? 'warning' : 'neutral',
            priority: 6 - index
          });
        }
      }
    });
  }

  addMotivationalAdvice() {
    const motivationalTips = [
      "💎 Every dollar you save today is a step towards financial freedom tomorrow.",
      "🌟 Small consistent changes compound into massive results over time.",
      "🎯 Set a specific financial goal for next month - it's easier to save with purpose!",
      "📚 Read one personal finance article this week to boost your money knowledge.",
      "💪 Financial fitness is just like physical fitness - it takes consistent daily habits.",
      "🔮 Visualize your future self thanking you for the financial decisions you make today.",
      "🌱 Your money is like a seed - the earlier you plant it, the bigger it grows."
    ];

    const randomTip = motivationalTips[Math.floor(Math.random() * motivationalTips.length)];
    this.adviceMessages.push({
      text: randomTip,
      type: 'tip',
      priority: 3
    });

    // Add seasonal or time-based advice
    const month = new Date().getMonth();
    if (month === 11 || month === 0) { // December or January
      this.adviceMessages.push({
        text: "🎄 Holiday season tip: Set a holiday budget and stick to it. Your future self will thank you in January!",
        type: 'tip',
        priority: 8
      });
    } else if (month >= 2 && month <= 4) { // Spring
      this.adviceMessages.push({
        text: "🌸 Spring cleaning time! Review your subscriptions and cancel ones you don't use regularly.",
        type: 'tip',
        priority: 6
      });
    }
  }

  getCategoryEmoji(category: string): string {
    const key = category.toLowerCase();
    return this.categoryEmojis[key] || this.categoryEmojis['other'];
  }

  getCategoryAdvice(category: SpendingAnalysis): string | null {
    const categoryLower = category.category.toLowerCase();
    const percentage = category.percentage;
    
    const adviceMap: { [key: string]: string[] } = {
      'groceries': [
        `Groceries are ${percentage.toFixed(1)}% of your spending. Try meal planning and shopping with a list to reduce impulse buys.`,
        `Consider buying generic brands and shopping sales to reduce your grocery bill by 10-20%.`
      ],
      'restaurants': [
        `Dining out is ${percentage.toFixed(1)}% of your budget. Try cooking at home 2-3 more nights per week.`,
        `Set a monthly restaurant budget and use apps like Groupon or happy hour specials to save money.`
      ],
      'entertainment': [
        `Entertainment is ${percentage.toFixed(1)}% of your spending. Look for free events in your area or consider sharing streaming subscriptions.`,
        `Try the "entertainment fund" method - set aside cash for fun activities to avoid overspending.`
      ],
      'utilities': [
        `Utilities represent ${percentage.toFixed(1)}% of your expenses. Simple changes like LED bulbs and programmable thermostats can cut costs by 15%.`,
        `Unplug electronics when not in use and consider energy-efficient appliances to reduce utility bills.`
      ],
      'transport': [
        `Transportation costs are ${percentage.toFixed(1)}% of your budget. Consider carpooling, public transit, or biking for shorter trips.`,
        `Regular car maintenance can improve fuel efficiency and reduce long-term costs.`
      ],
      'shopping': [
        `Shopping represents ${percentage.toFixed(1)}% of your spending. Try the "want vs need" test and wait 48 hours before non-essential purchases.`,
        `Use price comparison apps and look for coupon codes before buying anything online.`
      ],
      'subscriptions': [
        `Subscriptions are ${percentage.toFixed(1)}% of your expenses. Audit them monthly and cancel unused services - you could save hundreds annually.`,
        `Consider sharing family plans with friends or family members to reduce subscription costs.`
      ],
      'health': [
        `Healthcare costs are ${percentage.toFixed(1)}% of your budget. Preventive care and maintaining good health habits can reduce long-term expenses.`,
        `Look into HSA accounts if available - they offer triple tax advantages for healthcare expenses.`
      ]
    };

    const categoryAdvice = adviceMap[categoryLower];
    if (categoryAdvice) {
      return categoryAdvice[Math.floor(Math.random() * categoryAdvice.length)];
    }

    // Generic advice for uncategorized spending
    if (percentage > 25) {
      return `This category represents ${percentage.toFixed(1)}% of your spending - consider if there are ways to optimize or reduce these expenses.`;
    }
    
    return null;
  }

  handleNoTransactions() {
    this.monthlyIncome = 0;
    this.monthlyExpenses = 0;
    this.topSpendingCategories = [];
    this.adviceMessages = [
      {
        text: "🌟 Ready to start your financial journey? Begin by tracking your income and expenses to get a clear picture of your money habits.",
        type: 'tip',
        priority: 10
      },
      {
        text: "📊 Start with the basics: Record every transaction for 30 days. You'll be amazed at what you discover about your spending patterns!",
        type: 'neutral',
        priority: 9
      },
      {
        text: "💡 Pro tip: Use the envelope method or budgeting apps to categorize your expenses and stay on track with your financial goals.",
        type: 'tip',
        priority: 8
      }
    ];
  }

  getBalanceStatus(): string {
    const difference = this.monthlyIncome - this.monthlyExpenses;
    if (difference > 0) return 'positive';
    if (difference < 0) return 'negative';
    return 'neutral';
  }

  getBalanceText(): string {
    const difference = this.monthlyIncome - this.monthlyExpenses;
    if (difference > 0) return 'Surplus';
    if (difference < 0) return 'Deficit';
    return 'Break Even';
  }

  goBack() {
    this.router.navigate(['/']);
  }

  generateNewAdvice() {
    if (this.allTransactions.length > 0) {
      this.performComprehensiveAnalysis();
      this.cdr.detectChanges();
    }
  }

  trackAdviceMessage(index: number, item: AdviceMessage): number {
    return index;
  }

  getFinancialHealthScore(): number {
    let score = 50; // Base score
    
    // Savings rate contribution (0-30 points)
    if (this.savingsRate > 0) {
      score += Math.min(this.savingsRate * 1.5, 30);
    } else if (this.savingsRate < 0) {
      score += Math.max(this.savingsRate * 2, -40);
    }
    
    // Income stability (0-20 points)
    if (this.monthlyIncome > 0) {
      score += 20;
    }
    
    // Spending control (0-20 points)
    if (this.spendingTrend < 0) {
      score += Math.min(Math.abs(this.spendingTrend), 20);
    } else if (this.spendingTrend > 10) {
      score -= Math.min(this.spendingTrend, 20);
    }
    
    // Diversification penalty if one category is >50% of spending
    if (this.topSpendingCategories.length > 0 && this.topSpendingCategories[0].percentage > 50) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  getHealthScoreDescription(): string {
    const score = this.getFinancialHealthScore();
    
    if (score >= 80) return "Excellent! You're crushing your financial goals! 🚀";
    if (score >= 70) return "Great job! You're on a solid financial path! 💪";
    if (score >= 60) return "Good progress! A few tweaks can boost your score! ⭐";
    if (score >= 50) return "You're on the right track! Keep building momentum! 📈";
    if (score >= 40) return "Some challenges, but you can turn this around! 💡";
    return "Time for a financial reset! Let's create a plan! 🎯";
  }

  getMotivationalQuote(): string {
    const quotes = [
      "A budget is telling your money where to go instead of wondering where it went.",
      "The real measure of your wealth is how much you'd be worth if you lost all your money.",
      "It's not how much money you make, but how much money you keep.",
      "The best investment you can make is in yourself.",
      "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.",
      "Every time you borrow money, you're robbing your future self.",
      "The habit of saving is itself an education; it fosters every virtue.",
      "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.",
      "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
      "Wealth consists not in having great possessions, but in having few wants."
    ];
    
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}