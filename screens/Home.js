import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const colors = ['#f39c12', '#e74c3c', '#9b59b6', '#27ae60', '#3498db', '#2ecc71', '#e67e22'];
const getColor = (index) => colors[index % colors.length];

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  useShadowColorFromDataset: false,
};

// Tarih formatını düzelten fonksiyon
const formatDate = (date) => {
  try {
    if (!date) return 'Tarih yok';
    
    // Eğer Firebase Timestamp ise
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('tr-TR');
    }
    
    // Eğer string ise
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? 'Geçersiz tarih' : parsedDate.toLocaleDateString('tr-TR');
    }
    
    // Eğer Date objesi ise
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? 'Geçersiz tarih' : date.toLocaleDateString('tr-TR');
    }
    
    // Diğer durumlar için
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? 'Geçersiz tarih' : parsedDate.toLocaleDateString('tr-TR');
  } catch (error) {
    console.log('Tarih formatı hatası:', error);
    return 'Tarih hatası';
  }
};

const Home = ({ navigation }) => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentIncomes, setRecentIncomes] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  const fetchTotals = async () => {
    let incomeSum = 0;
    let expenseSum = 0;

    const incomeSnap = await getDocs(collection(db, 'incomes'));
    incomeSnap.forEach(doc => {
      incomeSum += Number(doc.data().amount);
    });

    const expensesSnap = await getDocs(collection(db, 'expenses'));
    expensesSnap.forEach(doc => {
      expenseSum += Number(doc.data().amount);
    });

    setTotalIncome(incomeSum);
    setTotalExpense(expenseSum);
  };

  const fetchRecent = async () => {
    try {
      const incomeQuery = query(collection(db, 'incomes'), orderBy('date', 'desc'), limit(3));
      const incomeSnap = await getDocs(incomeQuery);
      setRecentIncomes(incomeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const expenseQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'), limit(3));
      const expenseSnap = await getDocs(expenseQuery);
      setRecentExpenses(expenseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.log('Veri çekme hatası:', error);
      // Hata durumunda boş array'ler set et
      setRecentIncomes([]);
      setRecentExpenses([]);
    }
  };

  const fetchExpenses = async () => {
    const querySnapshot = await getDocs(collection(db, 'expenses'));
    const rawData = [];
    querySnapshot.forEach((doc) => {
      rawData.push(doc.data());
    });

    const grouped = rawData.reduce((acc, curr) => {
      const { category, amount } = curr;
      acc[category] = (acc[category] || 0) + Number(amount);
      return acc;
    }, {});

    const pieData = Object.keys(grouped).map((key, index) => ({
      name: key,
      amount: grouped[key],
      color: getColor(index),
      legendFontColor: '#333',
      legendFontSize: 14,
    }));

    setExpenseData(pieData);
  };

  // Kalan bütçe rengini belirle
  const getRemainingBudgetColor = () => {
    const remaining = totalIncome - totalExpense;
    if (remaining > 0) return '#4caf50'; // Yeşil
    if (remaining < 0) return '#f44336'; // Kırmızı
    return '#9e9e9e'; // Gri
  };

  // Bütçe dengesi pasta grafiği verisi
  const getBudgetBalanceData = () => {
    if (totalIncome === 0 && totalExpense === 0) return [];
    
    return [
      {
        name: 'Gelir',
        amount: totalIncome,
        color: '#4caf50',
        legendFontColor: '#333',
        legendFontSize: 14,
      },
      {
        name: 'Gider',
        amount: totalExpense,
        color: '#f44336',
        legendFontColor: '#333',
        legendFontSize: 14,
      }
    ];
  };

  // Sayfa odaklandığında verileri çek
  useFocusEffect(
    useCallback(() => {
      fetchTotals();
      fetchRecent();
      fetchExpenses();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Bütçe Özeti</Text>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryText}>Toplam Gelir: <Text style={styles.incomeText}>{totalIncome} ₺</Text></Text>
          <Text style={styles.summaryText}>Toplam Gider: <Text style={styles.expenseText}>{totalExpense} ₺</Text></Text>
          <Text style={styles.summaryText}>
            Kalan Bütçe: <Text style={[styles.remainingText, { color: getRemainingBudgetColor() }]}>
              {totalIncome - totalExpense} ₺
            </Text>
          </Text>
        </Card.Content>
      </Card>

      <Text style={styles.header}>Bütçe Dengesi</Text>
      {getBudgetBalanceData().length > 0 ? (
        <PieChart
          data={getBudgetBalanceData()}
          width={screenWidth - 20}
          height={220}
          accessor="amount"
          chartConfig={chartConfig}
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.message}>Henüz gelir veya gider verisi yok.</Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddIncome')}
          style={styles.button}
          buttonColor="#4caf50"
        >
          Gelir Ekle
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddExpense')}
          style={styles.button}
          buttonColor="#f44336"
        >
          Gider Ekle
        </Button>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CategoryAdd')}
          style={styles.button}
          buttonColor="#2196f3"
        >
          Kategori Ekle
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('AllIncomes')}
          style={styles.button}
          buttonColor="#4caf50"
        >
          Tüm Gelirleri Görüntüle
        </Button>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AllExpenses')}
          style={styles.button}
          buttonColor="#f44336"
        >
          Tüm Giderleri Görüntüle
        </Button>
      </View>

      <Text style={styles.header}>Son 3 Gelir</Text>
      {recentIncomes.length > 0 ? (
        recentIncomes.map(item => (
          <Card key={item.id} style={[styles.card, styles.incomeCard]}>
            <Card.Content>
              <Text style={styles.cardText}>{item.category} - {item.amount} ₺</Text>
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.message}>Henüz gelir verisi yok.</Text>
          </Card.Content>
        </Card>
      )}

      <Text style={styles.header}>Son 3 Gider</Text>
      {recentExpenses.length > 0 ? (
        recentExpenses.map(item => (
          <Card key={item.id} style={[styles.card, styles.expenseCard]}>
            <Card.Content>
              <Text style={styles.cardText}>{item.category} - {item.amount} ₺</Text>
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.message}>Henüz gider verisi yok.</Text>
          </Card.Content>
        </Card>
      )}

      <Text style={styles.header}>Gider Dağılımı</Text>
      {expenseData.length > 0 ? (
        <PieChart
          data={expenseData}
          width={screenWidth - 20}
          height={220}
          accessor="amount"
          chartConfig={chartConfig}
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.message}>Henüz gider verisi yok.</Text>
          </Card.Content>
        </Card>
      )}

      {/* Öğrenci Bilgileri */}
      <Card style={styles.studentCard}>
        <Card.Content>
          <Text style={styles.studentText}>Öğrenci No: 2118121031</Text>
          <Text style={styles.studentText}>Ad Soyad: [EMRE AKKAYA]</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#2c3e50',
  },
  summaryCard: {
    marginVertical: 6,
    backgroundColor: '#ecf0f1',
  },
  summaryText: {
    fontSize: 16,
    marginVertical: 2,
    color: '#2c3e50',
    fontWeight: '500',
  },
  incomeText: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  expenseText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  remainingText: {
    fontWeight: 'bold',
  },
  card: {
    marginVertical: 6,
  },
  incomeCard: {
    backgroundColor: '#e8f5e8',
  },
  expenseCard: {
    backgroundColor: '#ffebee',
  },
  cardText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  dateText: {
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  message: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  studentCard: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#3498db',
  },
  studentText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Home;