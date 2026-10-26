import { User } from '../models/User';
import { ClassModel } from '../models/Class';
import { Membership } from '../models/Membership';
import { Assignment } from '../models/Assignment';
import { Submission } from '../models/Submission';
import { Activity } from '../models/Activity';
import { ActivityAttempt } from '../models/ActivityAttempt';
import { hashPassword } from '../lib/password';

export async function seedDatabase() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('ℹ️ Veritabanı zaten dolu, seed atlandı.');
    return;
  }

  console.log('🌱 Örnek veriler ve demo kullanıcılar oluşturuluyor...');

  const passwordHash = await hashPassword('123456');

  // 1. Create Teacher
  const teacher = await User.create({
    email: 'ogretmen@sinifbulutu.com',
    passwordHash,
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    role: 'teacher',
    profileCompleted: true,
    school: 'Atatürk Fen Lisesi',
    branch: 'Matematik',
    emailVerified: true,
  });

  // 2. Create Students
  const student1 = await User.create({
    email: 'ogrenci@sinifbulutu.com',
    passwordHash,
    firstName: 'Zeynep',
    lastName: 'Kaya',
    role: 'student',
    profileCompleted: true,
    school: 'Atatürk Fen Lisesi',
    gradeLevel: '9',
    birthYear: 2010,
    emailVerified: true,
  });

  const student2 = await User.create({
    email: 'can@sinifbulutu.com',
    passwordHash,
    firstName: 'Can',
    lastName: 'Demir',
    role: 'student',
    profileCompleted: true,
    school: 'Atatürk Fen Lisesi',
    gradeLevel: '9',
    birthYear: 2010,
    emailVerified: true,
  });

  // 3. Create Classes
  const classMath = await ClassModel.create({
    teacherId: teacher._id,
    name: '9-A Matematik',
    subject: 'Matematik',
    description: '2025-2026 Eğitim Öğretim Yılı 9. Sınıf Matematik Dersi',
    color: '#2563EB',
    term: '2025-2026 Bahar',
    joinCode: 'MAT101',
    joinMode: 'auto',
    joiningOpen: true,
    allowLate: true,
    archived: false,
  });

  const classPhysics = await ClassModel.create({
    teacherId: teacher._id,
    name: '10-B Fizik',
    subject: 'Fizik',
    description: 'Kuvvet ve Hareket, Dalgalar ve Optik',
    color: '#7C3AED',
    term: '2025-2026 Bahar',
    joinCode: 'FIZ202',
    joinMode: 'auto',
    joiningOpen: true,
    allowLate: false,
    archived: false,
  });

  // 4. Enroll Students
  await Membership.create({
    classId: classMath._id,
    studentId: student1._id,
    status: 'active',
    joinedAt: new Date(),
  });

  await Membership.create({
    classId: classMath._id,
    studentId: student2._id,
    status: 'active',
    joinedAt: new Date(),
  });

  await Membership.create({
    classId: classPhysics._id,
    studentId: student1._id,
    status: 'active',
    joinedAt: new Date(),
  });

  // 5. Create Assignments
  const dueMath1 = new Date();
  dueMath1.setDate(dueMath1.getDate() + 3);

  const dueMath2 = new Date();
  dueMath2.setDate(dueMath2.getDate() + 6);

  const assignment1 = await Assignment.create({
    classId: classMath._id,
    teacherId: teacher._id,
    title: 'Fonksiyonlar ve Grafik Çizimi',
    description: 'Sayfa 142-146 arasındaki alıştırmaları defterinize çözüp fotoğraflarını yükleyiniz.',
    dueAt: dueMath1,
    maxPoints: 100,
    submissionTypes: ['photo', 'file', 'text'],
    allowLate: true,
    status: 'published',
  });

  const assignment2 = await Assignment.create({
    classId: classMath._id,
    teacherId: teacher._id,
    title: 'İkinci Dereceden Denklemler Projesi',
    description: 'Kökler toplamı ve çarpımı bağıntılarını gösteren 5 özgün soru hazırlayınız.',
    dueAt: dueMath2,
    maxPoints: 100,
    submissionTypes: ['file', 'text'],
    allowLate: false,
    status: 'published',
  });

  // 6. Create Submission from Student 1 (Graded)
  await Submission.create({
    assignmentId: assignment1._id,
    classId: classMath._id,
    studentId: student1._id,
    textAnswer: 'Ödev sorularını çözdüm ve adımları açıkladım.',
    files: [
      {
        name: 'sayfa142_cozum.jpg',
        size: 1024 * 350,
        url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        mime: 'image/jpeg',
      },
    ],
    status: 'graded',
    submittedAt: new Date(),
    points: 95,
    feedback: 'Harika bir çözüm olmuş Zeynep, tebrikler!',
    gradedAt: new Date(),
  });

  // 7. Interactive Activities
  // Quiz
  const quizActivity = await Activity.create({
    classId: classMath._id,
    teacherId: teacher._id,
    title: 'Fonksiyonlar Hızlı Test',
    description: '4 soruluk çoktan seçmeli hızlı bilgi yarışması',
    templateType: 'quiz',
    timeLimitSeconds: 60,
    maxScore: 100,
    status: 'published',
    items: [
      {
        id: 'q1',
        question: 'f(x) = 2x + 5 ise f(3) kaçtır?',
        options: ['9', '10', '11', '12'],
        correctAnswer: '11',
        points: 25,
      },
      {
        id: 'q2',
        question: 'Birebir ve örten fonksiyonlara ne ad verilir?',
        options: ['Birim', 'Sabit', 'Bijektif', 'Doğrusal'],
        correctAnswer: 'Bijektif',
        points: 25,
      },
      {
        id: 'q3',
        question: 'f(x) = x² fonksiyonunun grafiği nedir?',
        options: ['Parabol', 'Doğru', 'Hiperbol', 'Çember'],
        correctAnswer: 'Parabol',
        points: 25,
      },
      {
        id: 'q4',
        question: 'Sabit fonksiyon f(x)=c için f(100) kaçtır?',
        options: ['100', 'c', '0', '1'],
        correctAnswer: 'c',
        points: 25,
      },
    ],
  });

  // Match Up
  await Activity.create({
    classId: classMath._id,
    teacherId: teacher._id,
    title: 'Kavram Eşleştirme',
    description: 'Terimleri doğru tanımlarla eşleştiriniz.',
    templateType: 'match_up',
    timeLimitSeconds: 90,
    maxScore: 100,
    status: 'published',
    items: [
      {
        id: 'm1',
        term: 'Tanım Kümesi',
        definition: 'Fonksiyonun girdi alabileceği değerler kümesi',
        points: 25,
      },
      {
        id: 'm2',
        term: 'Değer Kümesi',
        definition: 'Fonksiyonun çıktılarının bulunduğu küme',
        points: 25,
      },
      {
        id: 'm3',
        term: 'Birim Fonksiyon',
        definition: 'Her elemanı kendisine eşleyen f(x)=x',
        points: 25,
      },
      {
        id: 'm4',
        term: 'Ters Fonksiyon',
        definition: 'Çıktıyı tekrar girdiye dönüştüren f⁻¹(x)',
        points: 25,
      },
    ],
  });

  // Spin Wheel
  await Activity.create({
    classId: classMath._id,
    teacherId: teacher._id,
    title: 'Şanslı Çarkıfelek',
    description: 'Çarkı çevir, gelen soruyu veya görevi çöz!',
    templateType: 'spin_wheel',
    timeLimitSeconds: 60,
    maxScore: 100,
    status: 'published',
    items: [
      { id: 'w1', label: 'f(0) değerini bul', points: 20 },
      { id: 'w2', label: 'Eğimi açıkla', points: 20 },
      { id: 'w3', label: 'Grafiği çiz', points: 20 },
      { id: 'w4', label: 'Kökleri topla', points: 20 },
      { id: 'w5', label: 'Tersini al', points: 20 },
    ],
  });

  // Open Box
  await Activity.create({
    classId: classMath._id,
    teacherId: teacher._id,
    title: 'Gizemli Soru Kutuları',
    description: 'Kutuları seç, içindeki soruları aç!',
    templateType: 'open_box',
    timeLimitSeconds: 120,
    maxScore: 100,
    status: 'published',
    items: [
      { id: 'b1', label: 'Kutu 1', question: 'f(x)=3x-1 ise f⁻¹(5) kaçtır?', correctAnswer: '2', points: 25 },
      { id: 'b2', label: 'Kutu 2', question: 'İki doğrunun kesişim noktası kaç tanedir?', correctAnswer: '1', points: 25 },
      { id: 'b3', label: 'Kutu 3', question: 'f(x)=5 sabit fonksiyonunun türevi kaçtır?', correctAnswer: '0', points: 25 },
      { id: 'b4', label: 'Kutu 4', question: 'f(g(x)) bileşke fonksiyon gösterimidir. Doğru mu?', correctAnswer: 'Doğru', points: 25 },
    ],
  });

  // Seed student attempt for leaderboard demo
  await ActivityAttempt.create({
    activityId: quizActivity._id,
    classId: classMath._id,
    studentId: student1._id,
    score: 100,
    maxScore: 100,
    timeSpentSeconds: 32,
    answers: [
      { itemId: 'q1', givenAnswer: '11', isCorrect: true },
      { itemId: 'q2', givenAnswer: 'Bijektif', isCorrect: true },
      { itemId: 'q3', givenAnswer: 'Parabol', isCorrect: true },
      { itemId: 'q4', givenAnswer: 'c', isCorrect: true },
    ],
    completedAt: new Date(),
  });

  console.log('✅ Demo veritabanı başarıyla dolduruldu:');
  console.log('   👨‍🏫 Öğretmen: ogretmen@sinifbulutu.com / 123456');
  console.log('   👩‍🎓 Öğrenci: ogrenci@sinifbulutu.com / 123456');
  console.log('   🏫 Sınıflar: 9-A Matematik (MAT101), 10-B Fizik (FIZ202)');
}
