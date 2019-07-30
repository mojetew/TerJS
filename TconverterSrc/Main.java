import java.io.*;
import java.util.ArrayList;
import java.util.Objects;

public class Main {

    public static void main(String[] args) {
        System.out.println("Deleting old folders...");
        //delete old folders
        for (File fl : Objects.requireNonNull(new File("site").listFiles()))
            if (fl.isDirectory())
                //noinspection ResultOfMethodCallIgnored
                fl.delete();
        //create new folders
        System.out.println("Converting...");
        ArrayList<DirCrawler> children = new ArrayList<>();
        for (File fl : Objects.requireNonNull(new File("database").listFiles()))
            if (fl.isDirectory())
                if (fl.getName().equals("maps")) children.add(new DirCrawler(fl, MapsData.class.getConstructors()[0]));
                else children.add(new DirCrawler(fl, TxtRead.class.getConstructors()[0]));
        //adds a simple progress bar so people don't exit the program too early
        try {
            System.out.print("[");
            for(int i = 1; i <= children.size();i++)System.out.print(' ');
            System.out.print("]");
            for (int i = 0; i < children.size(); i++) {
                children.get(i).join();
                System.out.print("\r[");
                for (int o = 0; o <= i; o++) System.out.print('>');
                for (int o = children.size(); o > i + 1; o--) System.out.print(' ');
                System.out.print("]");
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
