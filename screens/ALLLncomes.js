import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

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

const AllIncomes = ({ navigation }) => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllIncomes = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'incomes'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const incomeList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setIncomes(incomeList);
      } catch (error) {
        console.error('Gelirler alınamadı:', error);
        setIncomes([]); // Hata durumunda boş array
      } finally {
        setLoading(false);
      }
    };

    fetchAllIncomes();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Gelirler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Tüm Gelirler</Text>
      {incomes.length > 0 ? (
        incomes.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate('IncomeEdit', { income: item })}
          >
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.text}>
                  {item.category} - {item.amount} ₺
                </Text>
                <Text style={styles.date}>
                  {formatDate(item.date)}
                </Text>
                {item.description && (
                  <Text style={styles.description}>
                    {item.description}
                  </Text>
                )}
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyMessage}>
              Henüz hiç gelir kaydı bulunmuyor.
            </Text>
          </Card.Content>
        </Card>
      )}
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
    marginBottom: 10,
    color: '#2c3e50',
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#e8f5e8',
  },
  text: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  date: {
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 4,
  },
  description: {
    color: '#95a5a6',
    fontSize: 14,
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    fontSize: 16,
  },
});

export default AllIncomes;